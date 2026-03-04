import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";
import {
  getMonthlyRecommendationCount,
  getTrackingDaysForPet,
  nextMonthlyResetDate,
} from "@/lib/user-engagement";

const requestSchema = z.object({
  petId: z.string().min(1),
  age: z.number().min(0),
  breed: z.string().min(1),
  symptoms: z.array(z.string()).default([]),
});

const systemPrompt =
  "You are a veterinary supplement expert specializing in pet longevity.";

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

  const limiter = rateLimit(request, `ai-recommendations:${session.user.id}`, {
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

    const isPremium = isSubscriptionActive(user);
    if (!isPremium) {
      const [trackingDays, monthlyCount] = await Promise.all([
        getTrackingDaysForPet(session.user.id, parsed.data.petId),
        getMonthlyRecommendationCount(session.user.id),
      ]);

      if (trackingDays < 7) {
        return NextResponse.json(
          {
            message: "Complete 7 days of tracking to unlock AI recommendations",
            code: "TRACKING_GATE",
            trackingDays,
          },
          { status: 403 }
        );
      }

      if (monthlyCount >= 3) {
        return NextResponse.json(
          {
            message: "Monthly free limit reached",
            code: "MONTHLY_LIMIT_REACHED",
            monthlyCount,
            monthlyLimit: 3,
            nextResetAt: nextMonthlyResetDate().toISOString(),
          },
          { status: 403 }
        );
      }
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Recommend evidence-based supplements for a ${parsed.data.age}-year-old ${parsed.data.breed} with these symptoms: ${parsed.data.symptoms.join(
      ", "
    )}. Focus on supplements like omega-3s, probiotics, joint support (glucosamine/chondroitin), antioxidants. Provide specific dosage recommendations when possible. Add an evidence ranking (low/medium/high) per supplement. Keep response under 300 words.`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      return NextResponse.json(
        { message: "No recommendation generated." },
        { status: 500 }
      );
    }

    await prisma.recommendation.create({
      data: {
        petId: parsed.data.petId,
        prompt,
        response: responseText,
        notes: "",
      },
    });

    const monthlyCount = isPremium
      ? null
      : await getMonthlyRecommendationCount(session.user.id);

    return NextResponse.json({
      response: responseText,
      monthlyCount,
      monthlyLimit: isPremium ? null : 3,
      nextResetAt: isPremium ? null : nextMonthlyResetDate().toISOString(),
    });
  } catch (error) {
    console.error("AI recommendation error", error);
    return NextResponse.json(
      { message: "Unable to generate recommendation." },
      { status: 500 }
    );
  }
}
