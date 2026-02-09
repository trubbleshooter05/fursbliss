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

const systemPrompt =
  "You are a veterinary pharmacology advisor. Always recommend consulting a veterinarian.";

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

For each interaction, return:
1. The two items
2. Severity: SAFE | CAUTION | AVOID
3. Plain-English explanation (1-2 sentences)
4. Recommendation

Also flag redundancies and dosage concerns for this weight. Provide an overall stack assessment.`;

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

    await prisma.aIInsight.create({
      data: {
        petId: parsed.data.petId,
        type: "interaction_check",
        content: responseText,
        prompt,
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      },
    });

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Interaction check error", error);
    return NextResponse.json(
      { message: "Unable to run interaction check." },
      { status: 500 }
    );
  }
}
