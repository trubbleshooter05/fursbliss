import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const requestSchema = z.object({
  photoLogId: z.string().min(1),
});

const analysisSchema = z.object({
  observation: z.string().min(1),
  changeFromPrevious: z.string().min(1),
  suggestions: z.array(z.string()).default([]),
  cautionFlags: z.array(z.string()).default([]),
  qualityScore: z.number().int().min(1).max(5),
});

const systemPrompt =
  "You are a veterinary observation assistant. Always recommend consulting a veterinarian. Return valid JSON only.";

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
      { message: "Photo AI analysis is a premium feature." },
      { status: 403 }
    );
  }

  const limiter = rateLimit(request, `ai-photo:${session.user.id}`, {
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

    const photo = await prisma.photoLog.findFirst({
      where: {
        id: parsed.data.photoLogId,
        pet: { userId: session.user.id },
      },
      include: { pet: true },
    });

    if (!photo) {
      return NextResponse.json({ message: "Photo not found" }, { status: 404 });
    }

    const prompt = `PHOTO_LOG_ID:${photo.id}
Analyze this photo of a ${photo.pet.breed}, ${photo.pet.age}y dog in category "${photo.category ?? "general"}".
Return JSON:
{
  "observation": "brief objective visual observation",
  "changeFromPrevious": "comparison statement",
  "suggestions": ["monitoring action 1", "monitoring action 2"],
  "cautionFlags": ["any concern that should trigger vet follow-up"],
  "qualityScore": 1-5
}
No markdown, JSON only.`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: photo.imageUrl },
            },
          ],
        },
      ],
      max_tokens: 400,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      return NextResponse.json({ message: "No analysis generated." }, { status: 500 });
    }

    const extractedJson = extractJsonObject(responseText);
    const parsedAnalysis = analysisSchema.safeParse(extractedJson);
    if (!parsedAnalysis.success) {
      return NextResponse.json(
        { message: "AI returned unstructured output. Please retry." },
        { status: 502 }
      );
    }

    const summaryText = [
      `Observation: ${parsedAnalysis.data.observation}`,
      `Change: ${parsedAnalysis.data.changeFromPrevious}`,
      `Quality score: ${parsedAnalysis.data.qualityScore}/5`,
      parsedAnalysis.data.suggestions.length > 0
        ? `Suggestions: ${parsedAnalysis.data.suggestions.join("; ")}`
        : "",
      parsedAnalysis.data.cautionFlags.length > 0
        ? `Cautions: ${parsedAnalysis.data.cautionFlags.join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    await prisma.photoLog.update({
      where: { id: photo.id },
      data: { aiAnalysis: summaryText },
    });

    await prisma.aIInsight.create({
      data: {
        petId: photo.petId,
        type: "photo_analysis",
        content: JSON.stringify(parsedAnalysis.data),
        prompt,
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      },
    });

    return NextResponse.json({ response: summaryText, structured: parsedAnalysis.data });
  } catch (error) {
    console.error("Photo analysis error", error);
    return NextResponse.json(
      { message: "Unable to analyze photo." },
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
