import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { nextQuizEmailStep } from "@/lib/email-sequence";

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const url = new URL(request.url);
  const secret = bearer ?? url.searchParams.get("secret");
  return secret && secret === process.env.CRON_SECRET;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.quizSubmission.findMany({
    where: { emailSequenceStep: { lt: 7 } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  let queued = 0;
  let advanced = 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";

  for (const submission of submissions) {
    const step = nextQuizEmailStep({
      createdAt: submission.createdAt,
      emailSequenceStep: submission.emailSequenceStep,
    });
    if (!step) {
      continue;
    }

    const body = step.buildBody({
      dogName: submission.dogName,
      breed: submission.breed,
      age: submission.age,
      score: submission.score,
      appUrl,
    });

    const result = await sendEmail({
      to: submission.email,
      subject: step.subject,
      text: body.text,
      html: body.html,
    });

    if (result.queued) {
      queued += 1;
    }

    await prisma.quizSubmission.update({
      where: { id: submission.id },
      data: { emailSequenceStep: step.step },
    });
    advanced += 1;
  }

  return NextResponse.json({
    processed: submissions.length,
    queued,
    advanced,
  });
}

