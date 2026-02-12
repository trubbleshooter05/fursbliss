import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const requestSchema = z.object({
  supplements: z.array(z.string().min(1)).min(2).max(12),
  petBreed: z.string().min(1),
  petAge: z.number().min(0).max(40),
  petWeight: z.number().min(1).max(400),
  petId: z.string().optional(),
});

const responseSchema = z.object({
  interactions: z.array(
    z.object({
      pair: z.tuple([z.string(), z.string()]),
      rating: z.enum(["SAFE", "CAUTION", "AVOID"]),
      explanation: z.string(),
    })
  ),
  summary: z.string(),
});

const systemPrompt = `You are a veterinary supplement interaction advisor. Given a list of supplements a dog is taking, identify any known interactions, contraindications, or dosage concerns.
Be specific about which supplements interact and why. Rate each interaction as: SAFE, CAUTION, or AVOID.
Always recommend consulting a veterinarian.
Format as JSON: { interactions: [{ pair: [string, string], rating: "SAFE"|"CAUTION"|"AVOID", explanation: string }], summary: string }`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(request, `supplement-interactions:${session.user.id}`, {
    limit: 12,
    windowMs: 60 * 60 * 1000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many interaction checks. Try again later." },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)) } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  const hasPremium = isSubscriptionActive(user);
  if (!hasPremium) {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const checksThisMonth = await prisma.aIInsight.count({
      where: {
        type: "supplement_interaction_check",
        pet: { userId: session.user.id },
        createdAt: { gte: monthAgo },
      },
    });

    if (checksThisMonth >= 1) {
      return NextResponse.json(
        { message: "Free plan includes 1 interaction check per month. Upgrade for unlimited checks." },
        { status: 403 }
      );
    }
  }

  let petIdForInsight: string | null = null;
  if (parsed.data.petId) {
    const pet = await prisma.pet.findFirst({
      where: { id: parsed.data.petId, userId: session.user.id },
      select: { id: true },
    });
    petIdForInsight = pet?.id ?? null;
  } else {
    const fallbackPet = await prisma.pet.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    petIdForInsight = fallbackPet?.id ?? null;
  }

  if (!petIdForInsight) {
    return NextResponse.json({ message: "Add a pet profile before running checks." }, { status: 400 });
  }

  const userPrompt = `Pet context:
- Breed: ${parsed.data.petBreed}
- Age: ${parsed.data.petAge}
- Weight: ${parsed.data.petWeight} lbs

Supplements:
${parsed.data.supplements.map((supplement) => `- ${supplement}`).join("\n")}

Return JSON only.`;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json({ message: "No response generated." }, { status: 500 });
    }

    const json = extractJsonObject(raw);
    const structured = responseSchema.safeParse(json);
    if (!structured.success) {
      return NextResponse.json(
        { message: "Unable to structure AI output.", raw },
        { status: 200 }
      );
    }

    await prisma.aIInsight.create({
      data: {
        petId: petIdForInsight,
        type: "supplement_interaction_check",
        content: JSON.stringify(structured.data),
        prompt: userPrompt,
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      },
    });

    return NextResponse.json({
      ok: true,
      premium: hasPremium,
      result: structured.data,
    });
  } catch (error) {
    console.error("Supplement interaction checker failed", error);
    return NextResponse.json({ message: "Unable to check interactions right now." }, { status: 500 });
  }
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
