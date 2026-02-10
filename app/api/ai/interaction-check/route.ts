import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const requestSchema = z.object({
  petId: z.string().min(1),
  stack: z.string().min(1),
  addItem: z.string().optional(),
});

const analysisSchema = z.object({
  overallRisk: z.enum(["LOW", "MODERATE", "HIGH"]),
  summary: z.string().min(1),
  interactions: z.array(
    z.object({
      items: z.array(z.string()).min(2),
      severity: z.enum(["SAFE", "CAUTION", "AVOID"]),
      explanation: z.string().min(1),
      recommendation: z.string().min(1),
    })
  ),
  dosageConcerns: z.array(z.string()).default([]),
  redundancies: z.array(z.string()).default([]),
  vetQuestions: z.array(z.string()).default([]),
});

const systemPrompt =
  "You are a veterinary pharmacology advisor. Always recommend consulting a veterinarian. Return valid JSON only.";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (!isSubscriptionActive(user)) {
    return NextResponse.json(
      { message: "Interaction checker is a premium feature." },
      { status: 403 }
    );
  }

  const limiter = rateLimit(request, `ai-interaction:${session.user.id}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many AI requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request payload" },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findFirst({
      where: { id: parsed.data.petId, userId: session.user.id },
    });

    if (!pet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    const prompt = `Analyze this supplement/medication stack for a ${pet.breed}, ${pet.age}y, ${pet.weight}lb dog.

CURRENT STACK: ${parsed.data.stack}
CHECKING ADDITION OF: ${parsed.data.addItem || "None"}

Return JSON with this exact shape:
{
  "overallRisk": "LOW" | "MODERATE" | "HIGH",
  "summary": "short summary",
  "interactions": [
    {
      "items": ["item1", "item2"],
      "severity": "SAFE" | "CAUTION" | "AVOID",
      "explanation": "plain English",
      "recommendation": "what to do next"
    }
  ],
  "dosageConcerns": ["..."],
  "redundancies": ["..."],
  "vetQuestions": ["..."]
}

If there are no interactions, return interactions as [].
No markdown, no code fences, JSON only.`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      return NextResponse.json(
        { message: "No response generated." },
        { status: 500 }
      );
    }

    const extractedJson = extractJsonObject(responseText);
    const parsedAnalysis = analysisSchema.safeParse(extractedJson);
    if (!parsedAnalysis.success) {
      return NextResponse.json(
        {
          response: responseText,
          structured: null,
          warning: "AI output could not be structured. Showing raw output.",
        },
        { status: 200 }
      );
    }

    await prisma.aIInsight.create({
      data: {
        petId: parsed.data.petId,
        type: "interaction_check",
        content: JSON.stringify(parsedAnalysis.data),
        prompt,
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      },
    });

    return NextResponse.json({
      response: responseText,
      structured: parsedAnalysis.data,
    });
  } catch (error) {
    console.error("Interaction check error", error);
    return NextResponse.json(
      { message: "Unable to run interaction check." },
      { status: 500 }
    );
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
