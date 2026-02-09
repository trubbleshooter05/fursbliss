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

const systemPrompt =
  "You are a veterinary observation assistant. Always recommend consulting a veterinarian.";

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

    const prompt = `Analyze this photo of a ${photo.pet.breed}, ${photo.pet.age}y dog in category "${photo.category ?? "general"}".
Provide: brief observation, changes vs. previous photos (if any), monitoring suggestions, and a 1-5 quality score.`;

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

    await prisma.photoLog.update({
      where: { id: photo.id },
      data: { aiAnalysis: responseText },
    });

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Photo analysis error", error);
    return NextResponse.json(
      { message: "Unable to analyze photo." },
      { status: 500 }
    );
  }
}
