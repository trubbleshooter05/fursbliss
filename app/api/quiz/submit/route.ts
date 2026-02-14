import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateLongevityScore } from "@/lib/quiz";
import { sendEmail } from "@/lib/email";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  dogName: z.string().trim().min(1).max(64),
  breed: z.string().trim().min(2).max(80),
  age: z.number().int().min(1).max(30),
  weight: z.number().min(1).max(400),
  concerns: z.array(z.string()).min(1).max(6),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid quiz submission." }, { status: 400 });
  }

  const breedProfile = await prisma.breedProfile.findFirst({
    where: { breed: parsed.data.breed },
    select: { averageLifespan: true },
  });
  const score = calculateLongevityScore({
    age: parsed.data.age,
    weight: parsed.data.weight,
    concerns: parsed.data.concerns,
    breedAvgLifespan: breedProfile?.averageLifespan ?? 12,
  });

  try {
    const submission = await prisma.quizSubmission.create({
      data: {
        email: parsed.data.email,
        dogName: parsed.data.dogName,
        breed: parsed.data.breed,
        age: parsed.data.age,
        weight: parsed.data.weight,
        concerns: parsed.data.concerns,
        score,
      },
    });

    if (process.env.RESEND_API_KEY) {
      await sendEmail({
        to: parsed.data.email,
        subject: `${parsed.data.dogName}'s Longevity Readiness Score: ${score}/100`,
        text: `Your readiness score is ${score}/100.\n\nView full recommendations: ${process.env.NEXT_PUBLIC_APP_URL}/quiz/results/${submission.id}`,
        html: `<div style="font-family: Arial, sans-serif; color: #111827;">
          <h2>${parsed.data.dogName}'s Longevity Readiness Score: ${score}/100</h2>
          <p>Thanks for taking the FursBliss quiz.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/quiz/results/${submission.id}" style="color:#0D6E6E;font-weight:600;">View your full results</a></p>
        </div>`,
      });
    }

    await sendMetaConversionEvent({
      eventName: "Lead",
      email: parsed.data.email,
      request,
    });

    return NextResponse.json({
      id: submission.id,
      score: submission.score,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "This quiz submission already exists." },
        { status: 409 }
      );
    }
    console.error("Quiz submission failed", error);
    return NextResponse.json(
      { message: "Unable to submit quiz right now." },
      { status: 500 }
    );
  }
}

