import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  getDueEmailSequenceSteps,
  markEmailSequenceStepFailed,
  markEmailSequenceStepSent,
  updateEnrollmentNextSendAt,
} from "@/lib/email/sequence";
import { createUnsubscribeToken } from "@/lib/email/unsubscribe";
import { buildLongevityReadinessReportPayload } from "@/lib/longevity/report";
import { buildWelcomeEmailOne } from "@/lib/email/templates/welcome-1";
import { buildWelcomeEmailTwo } from "@/lib/email/templates/welcome-2";
import { buildWelcomeEmailThree } from "@/lib/email/templates/welcome-3";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (vercelCronHeader) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const url = new URL(request.url);
  const secret = bearer ?? url.searchParams.get("secret");
  return Boolean(secret && secret === process.env.CRON_SECRET);
}

function buildIdempotencyKey(stepId: string, sequenceType: string, stepNumber: number) {
  return `fursbliss:${sequenceType}:step-${stepNumber}:${stepId}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
  const dueSteps = await getDueEmailSequenceSteps(200);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const dueStep of dueSteps) {
    const { enrollment } = dueStep;
    const user = enrollment.user;

    if (!user?.email) {
      skipped += 1;
      await markEmailSequenceStepFailed(dueStep.id);
      await updateEnrollmentNextSendAt(enrollment.id);
      continue;
    }

    try {
      const latestQuiz = await prisma.quizSubmission.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });
      const latestPet = await prisma.pet.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });

      const dogName = latestQuiz?.dogName ?? latestPet?.name ?? "your dog";
      const unsubscribeToken = createUnsubscribeToken({
        enrollmentId: enrollment.id,
        userId: user.id,
      });
      const unsubscribeUrl = `${appUrl}/api/email/unsubscribe?token=${encodeURIComponent(
        unsubscribeToken
      )}`;

      let template:
        | ReturnType<typeof buildWelcomeEmailOne>
        | ReturnType<typeof buildWelcomeEmailTwo>
        | ReturnType<typeof buildWelcomeEmailThree>;

      if (dueStep.step === 1) {
        const breedAverageLifespan = latestQuiz?.breed
          ? (
              await prisma.breedProfile.findFirst({
                where: { breed: latestQuiz.breed },
                select: { averageLifespan: true },
              })
            )?.averageLifespan ?? null
          : null;

        const reportPayload = buildLongevityReadinessReportPayload({
          dogName,
          breed: latestQuiz?.breed ?? latestPet?.breed ?? "Mixed Breed",
          age: latestQuiz?.age ?? latestPet?.age ?? 8,
          weight: latestQuiz?.weight ?? latestPet?.weight ?? 40,
          concerns: latestQuiz?.concerns ?? [],
          score: latestQuiz?.score ?? 55,
          breedAverageLifespan,
        });

        template = buildWelcomeEmailOne({
          appUrl,
          dashboardUrl: `${appUrl}/dashboard`,
          unsubscribeUrl,
          reportPayload,
          reportDownloadUrl: latestQuiz ? `${appUrl}/api/reports/longevity/${latestQuiz.id}` : undefined,
        });
      } else if (dueStep.step === 2) {
        template = buildWelcomeEmailTwo({
          dogName,
          dashboardUrl: `${appUrl}/dashboard`,
          unsubscribeUrl,
        });
      } else if (dueStep.step === 3) {
        const isLoyEligible =
          (latestQuiz?.age ?? latestPet?.age ?? 0) >= 10 &&
          (latestQuiz?.weight ?? latestPet?.weight ?? 0) >= 14;

        template = buildWelcomeEmailThree({
          dogName,
          pricingUrl: `${appUrl}/pricing`,
          unsubscribeUrl,
          eligibilityLabel: isLoyEligible ? "Appears eligible" : "Not yet eligible",
        });
      } else {
        skipped += 1;
        await markEmailSequenceStepFailed(dueStep.id);
        await updateEnrollmentNextSendAt(enrollment.id);
        continue;
      }

      const result = await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        idempotencyKey: buildIdempotencyKey(
          dueStep.id,
          enrollment.sequenceType,
          dueStep.step
        ),
      });

      await markEmailSequenceStepSent(dueStep.id, result.messageId);
      await updateEnrollmentNextSendAt(enrollment.id);
      sent += 1;
    } catch (error) {
      console.error("[email-drip] failed to send step", {
        stepId: dueStep.id,
        enrollmentId: dueStep.enrollmentId,
        step: dueStep.step,
        error: error instanceof Error ? error.message : String(error),
      });
      failed += 1;
      await markEmailSequenceStepFailed(dueStep.id);
      await updateEnrollmentNextSendAt(enrollment.id);
    }
  }

  return NextResponse.json({
    processed: dueSteps.length,
    sent,
    failed,
    skipped,
  });
}
