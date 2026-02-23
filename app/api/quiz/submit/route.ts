import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateLongevityScore } from "@/lib/quiz";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320).optional(),
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
    const fallbackEmail = `anon_${randomUUID()}@fursbliss.local`;
    const normalizedEmail = parsed.data.email?.trim().toLowerCase() || fallbackEmail;

    const submission = await prisma.quizSubmission.create({
      data: {
        email: normalizedEmail,
        dogName: parsed.data.dogName,
        breed: parsed.data.breed,
        age: parsed.data.age,
        weight: parsed.data.weight,
        concerns: parsed.data.concerns,
        score,
      },
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

