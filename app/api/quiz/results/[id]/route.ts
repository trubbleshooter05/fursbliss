import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildQuizRecommendations } from "@/lib/quiz";

type RouteProps = {
  params: { id: string };
};

export async function GET(_: Request, { params }: RouteProps) {
  const submission = await prisma.quizSubmission.findUnique({
    where: { id: params.id },
  });

  if (!submission) {
    return NextResponse.json({ message: "Result not found" }, { status: 404 });
  }

  const recommendations = buildQuizRecommendations({
    dogName: submission.dogName,
    breed: submission.breed,
    age: submission.age,
    weight: submission.weight,
    concerns: submission.concerns,
    score: submission.score,
  });

  return NextResponse.json({
    id: submission.id,
    score: submission.score,
    dogName: submission.dogName,
    breed: submission.breed,
    age: submission.age,
    weight: submission.weight,
    concerns: submission.concerns,
    recommendations,
  });
}

