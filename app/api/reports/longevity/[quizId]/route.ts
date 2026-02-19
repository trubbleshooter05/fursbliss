import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildLongevityReadinessReportPayload } from "@/lib/longevity/report";
import { renderLongevityReadinessPdf } from "@/lib/reports/longevity-pdf";

export const runtime = "nodejs";

type RouteContext = {
  params: {
    quizId: string;
  };
};

function buildSignupCarryOverUrl(baseUrl: string, submission: {
  id: string;
  dogName: string;
  breed: string;
  age: number;
  weight: number;
  concerns: string[];
  email: string;
}) {
  const qp = new URLSearchParams({
    fromQuiz: "1",
    quizId: submission.id,
    dogName: submission.dogName,
    breed: submission.breed,
    age: String(submission.age),
    weight: String(submission.weight),
    concerns: submission.concerns.join(","),
    email: submission.email,
  });

  return `${baseUrl}/signup?${qp.toString()}`;
}

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.quizSubmission.findUnique({
    where: { id: params.quizId },
    select: {
      id: true,
      userId: true,
      email: true,
      dogName: true,
      breed: true,
      age: true,
      weight: true,
      concerns: true,
      score: true,
    },
  });

  if (!submission) {
    return NextResponse.json({ message: "Quiz result not found." }, { status: 404 });
  }

  if (submission.userId !== session.user.id) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
    return NextResponse.json(
      {
        message: "Save this quiz to your account before downloading the report.",
        signupUrl: buildSignupCarryOverUrl(baseUrl, submission),
      },
      { status: 403 }
    );
  }

  const breedProfile = await prisma.breedProfile.findFirst({
    where: { breed: submission.breed },
    select: { averageLifespan: true },
  });

  const payload = buildLongevityReadinessReportPayload({
    dogName: submission.dogName,
    breed: submission.breed,
    age: submission.age,
    weight: submission.weight,
    concerns: submission.concerns,
    score: submission.score,
    breedAverageLifespan: breedProfile?.averageLifespan ?? null,
  });

  // v1 behavior: generate a fresh report on each download request.
  const pdfBuffer = await renderLongevityReadinessPdf(payload);
  const reportName = `${safeFilename(submission.dogName)}-longevity-readiness-report.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
