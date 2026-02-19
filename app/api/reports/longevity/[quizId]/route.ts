import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildLongevityReadinessReportPayload } from "@/lib/longevity/report";
import { renderLongevityReadinessPdf } from "@/lib/reports/longevity-pdf";

export const runtime = "nodejs";

type RouteContext = {
  params?: {
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

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function resolveQuizId(request: Request, context?: RouteContext) {
  if (context?.params?.quizId) {
    return context.params.quizId;
  }
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export async function GET(request: Request, context: RouteContext) {
  const quizId = resolveQuizId(request, context);
  if (!quizId) {
    return NextResponse.json({ message: "Missing quiz id." }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const submission = await prisma.quizSubmission.findUnique({
      where: { id: quizId },
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

    const normalizedSubmission = {
      dogName: asString(submission.dogName, "Your Dog"),
      breed: asString(submission.breed, "Mixed Breed"),
      age: asNumber(submission.age, 8),
      weight: asNumber(submission.weight, 40),
      concerns: asStringArray(submission.concerns),
      score: asNumber(submission.score, 55),
    };

    const payload = buildLongevityReadinessReportPayload({
      dogName: normalizedSubmission.dogName,
      breed: normalizedSubmission.breed,
      age: normalizedSubmission.age,
      weight: normalizedSubmission.weight,
      concerns: normalizedSubmission.concerns,
      score: normalizedSubmission.score,
      breedAverageLifespan: breedProfile?.averageLifespan ?? null,
    });

    // v1 behavior: generate a fresh report on each download request.
    const pdfBuffer = await renderLongevityReadinessPdf(payload);
    const reportName = `${safeFilename(normalizedSubmission.dogName)}-longevity-readiness-report.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${reportName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[longevity-report] route failed", {
      quizId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { message: "Unable to generate report right now." },
      { status: 500 }
    );
  }
}
