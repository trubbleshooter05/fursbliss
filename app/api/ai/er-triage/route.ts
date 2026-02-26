import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const requestSchema = z.object({
  petId: z.string().min(1),
  symptoms: z.string().trim().min(10),
  duration: z.string().trim().min(1),
  behaviorChanges: z.string().trim().optional(),
  eatingDrinking: z.string().trim().optional(),
  bathroomChanges: z.string().trim().optional(),
  emergencyFlags: z.array(z.string()).default([]),
});

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

function basicUrgency(symptoms: string, emergencyFlags: string[]) {
  const text = `${symptoms} ${emergencyFlags.join(" ")}`.toLowerCase();
  const hardFlags = ["seizure", "collapse", "can not breathe", "can't breathe", "unresponsive"];
  const urgentFlags = ["bloody stool", "vomit blood", "severe pain", "not eating", "not drinking"];

  if (hardFlags.some((flag) => text.includes(flag)) || emergencyFlags.length >= 2) {
    return {
      urgencyLevel: "EMERGENCY_NOW" as const,
      urgencyReason: "Potential emergency indicators were detected.",
    };
  }
  if (urgentFlags.some((flag) => text.includes(flag))) {
    return {
      urgencyLevel: "VET_TODAY" as const,
      urgencyReason: "Symptoms suggest same-day veterinary evaluation.",
    };
  }
  return {
    urgencyLevel: "VET_SOON" as const,
    urgencyReason: "Monitor closely and contact your vet if symptoms continue or worsen.",
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
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(request, `ai-er-triage:${session.user.id}`, {
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: parsed.data.petId, userId: session.user.id },
    select: { id: true, name: true, breed: true, age: true, weight: true },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found." }, { status: 404 });
  }

  const urgencyPreview = basicUrgency(parsed.data.symptoms, parsed.data.emergencyFlags);
  const isPremium = isSubscriptionActive(user);

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
