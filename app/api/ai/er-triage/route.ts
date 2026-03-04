import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";
import { sendServerMetaEvent } from "@/lib/meta-capi";

const requestSchema = z.object({
  petId: z.string().min(1).optional(),
  petName: z.string().trim().min(1).max(60).optional(),
  petBreed: z.string().trim().min(1).max(80).optional(),
  petAge: z.coerce.number().min(0).max(40).optional(),
  petWeight: z.coerce.number().min(1).max(300).optional(),
  symptoms: z.string().trim().min(5),
  duration: z.string().trim().min(1),
  behaviorChanges: z.string().trim().optional(),
  eatingDrinking: z.string().trim().optional(),
  bathroomChanges: z.string().trim().optional(),
  emergencyFlags: z.array(z.string()).default([]),
}).refine(
  (data) =>
    Boolean(data.petId) ||
    Boolean(data.petName && data.petBreed && data.petAge !== undefined && data.petWeight !== undefined),
  { message: "Provide either petId or pet profile details." }
);

const triageSchema = z.object({
  urgencyLevel: z.enum(["EMERGENCY_NOW", "VET_TODAY", "VET_SOON", "HOME_MONITOR"]),
  urgencyReason: z.string().min(1),
  likelyCategories: z.array(z.string()).default([]),
  whatToMonitorNext24h: z.array(z.string()).default([]),
  homeCareSteps: z.array(z.string()).default([]),
  vetPrepChecklist: z.array(z.string()).default([]),
  emergencyRedFlagsNow: z.array(z.string()).default([]),
  disclaimer: z.string().min(1),
});

type BasicUrgencyResult = {
  urgencyLevel: "EMERGENCY_NOW" | "VET_TODAY" | "VET_SOON" | "HOME_MONITOR";
  urgencyReason: string;
  freeWhy: string;
  freeNextSteps: string[];
};

function pickByHash(seed: string, options: string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return options[hash % options.length] ?? options[0] ?? "";
}

function detectFocusArea(text: string): string {
  if (text.includes("vomit") || text.includes("diarrhea") || text.includes("stool")) return "digestive";
  if (text.includes("limp") || text.includes("pain") || text.includes("stiff")) return "mobility";
  if (text.includes("breathe") || text.includes("cough")) return "breathing";
  if (text.includes("tired") || text.includes("letharg") || text.includes("low energy")) return "energy";
  if (text.includes("pee") || text.includes("urinat")) return "urinary";
  return "general";
}

const severeKeywordWeights: Array<{ phrase: string; weight: number }> = [
  { phrase: "seizure", weight: 5 },
  { phrase: "collapsed", weight: 5 },
  { phrase: "collapse", weight: 5 },
  { phrase: "can't breathe", weight: 6 },
  { phrase: "can not breathe", weight: 6 },
  { phrase: "unresponsive", weight: 6 },
  { phrase: "hit by car", weight: 6 },
  { phrase: "bloated", weight: 4 },
  { phrase: "swollen hard belly", weight: 4 },
  { phrase: "vomiting blood", weight: 5 },
  { phrase: "bloody diarrhea", weight: 5 },
  { phrase: "straining to urinate", weight: 4 },
  { phrase: "can't pee", weight: 5 },
  { phrase: "cant pee", weight: 5 },
];

const urgentKeywordWeights: Array<{ phrase: string; weight: number }> = [
  { phrase: "breathing hard", weight: 3 },
  { phrase: "breathing fast", weight: 3 },
  { phrase: "bloody stool", weight: 4 },
  { phrase: "vomit blood", weight: 4 },
  { phrase: "toxic", weight: 4 },
  { phrase: "ate chocolate", weight: 4 },
  { phrase: "ate grapes", weight: 4 },
  { phrase: "ate raisin", weight: 4 },
  { phrase: "ate xylitol", weight: 5 },
  { phrase: "not eating", weight: 2 },
  { phrase: "won't eat", weight: 2 },
  { phrase: "wont eat", weight: 2 },
  { phrase: "not drinking", weight: 3 },
  { phrase: "lethargic", weight: 2 },
  { phrase: "very tired", weight: 2 },
  { phrase: "severe pain", weight: 4 },
  { phrase: "limping and crying", weight: 3 },
  { phrase: "shaking", weight: 2 },
  { phrase: "trembling", weight: 2 },
  { phrase: "panting a lot", weight: 2 },
  { phrase: "restless", weight: 2 },
  { phrase: "won't settle", weight: 2 },
];

const mildKeywordWeights: Array<{ phrase: string; weight: number }> = [
  { phrase: "mild limp", weight: -1 },
  { phrase: "slightly tired", weight: -1 },
  { phrase: "mild cough", weight: -1 },
  { phrase: "low appetite", weight: -1 },
  { phrase: "sleepy", weight: -1 },
  { phrase: "a little tired", weight: -1 },
  { phrase: "just tired", weight: -1 },
  { phrase: "sleepier than usual", weight: -1 },
];

const softConcernWeights: Array<{ phrase: string; weight: number }> = [
  { phrase: "acting off", weight: 1 },
  { phrase: "acting weird", weight: 1 },
  { phrase: "not herself", weight: 1 },
  { phrase: "not himself", weight: 1 },
  { phrase: "seems off", weight: 1 },
  { phrase: "out of character", weight: 1 },
  { phrase: "off today", weight: 1 },
  { phrase: "not acting like herself", weight: 1 },
  { phrase: "not acting like himself", weight: 1 },
  { phrase: "quiet today", weight: 1 },
];

function scorePhraseSet(text: string, entries: Array<{ phrase: string; weight: number }>): number {
  return entries.reduce((total, entry) => {
    if (!text.includes(entry.phrase)) return total;
    return total + entry.weight;
  }, 0);
}

function basicUrgency(input: {
  petName: string;
  petBreed: string;
  petAge: number;
  petWeight: number;
  symptoms: string;
  duration: string;
  behaviorChanges?: string;
  eatingDrinking?: string;
  bathroomChanges?: string;
  emergencyFlags: string[];
}): BasicUrgencyResult {
  const text = `${input.symptoms} ${input.behaviorChanges ?? ""} ${input.eatingDrinking ?? ""} ${input.bathroomChanges ?? ""} ${input.emergencyFlags.join(" ")}`.toLowerCase();
  const severeScore = scorePhraseSet(text, severeKeywordWeights);
  const urgentScore = scorePhraseSet(text, urgentKeywordWeights);
  const mildScore = scorePhraseSet(text, mildKeywordWeights);
  const softConcernScore = scorePhraseSet(text, softConcernWeights);
  const hasSevere = severeScore > 0;
  const hasUrgent = urgentScore > 0;
  const hasMild = mildScore < 0;

  let score = 0;
  if (input.emergencyFlags.length >= 2) score += 5;
  else if (input.emergencyFlags.length === 1) score += 2;
  score += Math.max(0, Math.min(7, severeScore));
  score += Math.max(0, Math.min(5, urgentScore));
  score += Math.max(-3, mildScore);
  score += Math.max(0, Math.min(2, softConcernScore));

  const durationScoreMap: Record<string, number> = {
    "Less than 1 hour": -1,
    "1-6 hours": 0,
    "6-24 hours": 1,
    "1-3 days": 2,
    "More than 3 days": 3,
  };
  score += durationScoreMap[input.duration] ?? 1;
  if (input.petAge >= 11) score += 1;
  if (input.petAge <= 1 && !hasMild) score += 1;
  if (input.petWeight >= 90 && hasUrgent) score += 1;
  if ((text.includes("not eating") || text.includes("won't eat") || text.includes("wont eat")) && text.includes("drinking")) {
    score -= 1;
  }
  if (text.includes("ate something weird")) score += 1;
  if ((text.includes("shaking") || text.includes("trembling")) && input.duration !== "Less than 1 hour") score += 1;

  const focusArea = detectFocusArea(text);

  const reasonSeed = `${input.petName}|${input.petBreed}|${text}|${input.duration}|${input.petAge}`;

  if (score >= 8) {
    return {
      urgencyLevel: "EMERGENCY_NOW" as const,
      urgencyReason: pickByHash(reasonSeed, [
        "Emergency warning signs were detected. Please seek emergency veterinary care now.",
        "This pattern can become life-threatening quickly. Head to the nearest ER now.",
      ]),
      freeWhy: `Multiple high-risk ${focusArea} signals were detected, including red-flag indicators that should be checked immediately.`,
      freeNextSteps: [
        "Go to the nearest emergency vet now.",
        "Bring a short timeline of when symptoms started and what changed.",
      ],
    };
  }
  if (score >= 5) {
    return {
      urgencyLevel: "VET_TODAY" as const,
      urgencyReason: pickByHash(reasonSeed, [
        "Your dog's signs suggest same-day veterinary evaluation is safest.",
        "This combination of symptoms is concerning enough for a vet visit today.",
      ]),
      freeWhy: `The current ${focusArea} symptom pattern plus timing suggests a meaningful risk of progression without same-day care.`,
      freeNextSteps: [
        "Call your vet today and ask for the earliest appointment.",
        "If breathing, pain, or alertness worsens, switch to ER immediately.",
      ],
    };
  }
  if (score <= 1) {
    return {
      urgencyLevel: "HOME_MONITOR" as const,
      urgencyReason: pickByHash(reasonSeed, [
        "Current signs look lower risk. Monitor closely at home and escalate if symptoms worsen.",
        "Right now this appears appropriate for careful home monitoring.",
      ]),
      freeWhy: `No immediate emergency pattern was detected in the current ${focusArea} details, so home monitoring is reasonable for now.`,
      freeNextSteps: [
        "Track appetite, energy, and bathroom changes over the next 12-24 hours.",
        "Escalate if new symptoms appear or current signs intensify.",
      ],
    };
  }
  return {
    urgencyLevel: "VET_SOON" as const,
    urgencyReason: pickByHash(reasonSeed, [
      "A vet visit this week is recommended if symptoms continue or progress.",
      "This is not an ER pattern now, but a routine vet visit soon is the safer next step.",
    ]),
    freeWhy: `Symptoms are not clearly emergent, but the ${focusArea} pattern and persistence suggest follow-up is still important.`,
    freeNextSteps: [
      "Book a regular vet visit in the next few days.",
      "Move to urgent care sooner if symptoms worsen or your dog seems distressed.",
    ],
  };
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "anon";
  const rateLimitKey = userId ? `ai-er-triage:${userId}` : `ai-er-triage:guest:${ip}`;

  const limiter = rateLimit(request, rateLimitKey, {
    limit: 6,
    windowMs: 60 * 60 * 1000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many triage requests. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)) },
      }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid triage payload." }, { status: 400 });
  }

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          email: true,
          subscriptionStatus: true, 
          subscriptionPlan: true, 
          subscriptionEndsAt: true 
        },
      })
    : null;

  const petFromDb =
    userId && parsed.data.petId
      ? await prisma.pet.findFirst({
          where: { id: parsed.data.petId, userId },
          select: { id: true, name: true, breed: true, age: true, weight: true },
        })
      : null;

  const pet = petFromDb ?? {
    id: undefined,
    name: parsed.data.petName ?? "Your dog",
    breed: parsed.data.petBreed ?? "Mixed breed",
    age: parsed.data.petAge ?? 7,
    weight: parsed.data.petWeight ?? 45,
  };

  const urgencyPreview = basicUrgency({
    petName: pet.name,
    petBreed: pet.breed,
    petAge: pet.age,
    petWeight: pet.weight,
    symptoms: parsed.data.symptoms,
    duration: parsed.data.duration,
    behaviorChanges: parsed.data.behaviorChanges,
    eatingDrinking: parsed.data.eatingDrinking,
    bathroomChanges: parsed.data.bathroomChanges,
    emergencyFlags: parsed.data.emergencyFlags,
  });
  const isPremium = user ? isSubscriptionActive(user) : false;

  if (!isPremium || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      urgency: urgencyPreview,
      premiumRequired: true,
      preview: [
        "Emergency triage level",
        "Immediate next steps",
        "Suggested vet prep checklist",
      ],
    });
  }

  const model = process.env.OPENAI_MODEL_TRIAGE ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const systemPrompt =
    "You are an emergency triage assistant for dog owners. Do not provide definitive diagnosis. Prioritize safety and recommend emergency care when uncertain. Return strict JSON only.";
  const prompt = `Dog profile:
- Name: ${pet.name}
- Breed: ${pet.breed}
- Age: ${pet.age}
- Weight: ${pet.weight} lbs

Reported symptoms: ${parsed.data.symptoms}
Duration: ${parsed.data.duration}
Behavior changes: ${parsed.data.behaviorChanges ?? "none"}
Eating/Drinking notes: ${parsed.data.eatingDrinking ?? "none"}
Bathroom notes: ${parsed.data.bathroomChanges ?? "none"}
Emergency flags checked: ${parsed.data.emergencyFlags.join(", ") || "none"}

Return JSON:
{
  "urgencyLevel": "EMERGENCY_NOW" | "VET_TODAY" | "VET_SOON" | "HOME_MONITOR",
  "urgencyReason": "short reason",
  "likelyCategories": ["..."],
  "whatToMonitorNext24h": ["..."],
  "homeCareSteps": ["..."],
  "vetPrepChecklist": ["..."],
  "emergencyRedFlagsNow": ["..."],
  "disclaimer": "informational and not veterinary diagnosis"
}`;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 700,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";
    const extracted = extractJsonObject(content);
    const structured = triageSchema.safeParse(extracted);
    if (!structured.success) {
      return NextResponse.json({
        urgency: urgencyPreview,
        premiumRequired: false,
        warning: "Could not structure AI response. Showing safety-first urgency preview.",
      });
    }

    if (pet.id) {
      await prisma.aIInsight.create({
        data: {
          petId: pet.id,
          type: "er_triage",
          content: JSON.stringify({
            ...structured.data,
            usage: completion.usage ?? null,
          }),
          prompt,
          model,
        },
      });
    }

    // Send server-side Meta CAPI event
    void sendServerMetaEvent("TriageCompleted", {
      email: user?.email,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
          request.headers.get("x-real-ip")?.trim() || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      customData: {
        urgency_level: structured.data.urgencyLevel,
        pet_name: petFromDb?.name || parsed.data.petName || "unknown",
        pet_age: petFromDb?.age || parsed.data.petAge,
        premium_user: isPremium,
      },
      sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/triage`,
    });

    return NextResponse.json({
      urgency: {
        urgencyLevel: structured.data.urgencyLevel,
        urgencyReason: structured.data.urgencyReason,
      },
      premiumRequired: false,
      detailed: structured.data,
    });
  } catch (error) {
    console.error("ER triage error", error);
    return NextResponse.json({
      urgency: urgencyPreview,
      premiumRequired: false,
      warning: "AI triage unavailable right now. Use safety-first urgency guidance.",
    });
  }
}
