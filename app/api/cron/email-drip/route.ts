import { NextResponse } from "next/server";
import { reportCronFailure } from "@/lib/cron-monitoring";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  completeEnrollmentById,
  getDueEmailSequenceSteps,
  markEmailSequenceStepFailed,
  markEmailSequenceStepSkipped,
  markEmailSequenceStepSent,
  updateEnrollmentNextSendAt,
} from "@/lib/email/sequence";
import { createUnsubscribeToken } from "@/lib/email/unsubscribe";
import { isSubscriptionActive } from "@/lib/subscription";
import { getMonthlyRecommendationCount, getTrackingDaysForPet } from "@/lib/user-engagement";
import { canSendEmail, logEmailSent } from "@/lib/email-throttle";

export const runtime = "nodejs";
const MAX_STEPS_PER_RUN = 50;
const MAX_RUNTIME_MS = 20_000;

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstNameOf(name?: string | null) {
  if (!name) return "there";
  const first = name.trim().split(/\s+/)[0];
  return first || "there";
}

function scoreSummary(score: number, breed: string, age: number) {
  if (score >= 80) {
    return `${breed} dogs around age ${age} with this score usually show strong day-to-day resilience with room to sharpen prevention habits.`;
  }
  if (score >= 60) {
    return `For a ${breed} at age ${age}, this score means a solid baseline with clear opportunities to improve long-term health consistency.`;
  }
  return `For a ${breed} at age ${age}, this score signals higher preventable risk and a strong need for steady daily tracking habits.`;
}

function buildEmailTemplate(input: {
  subject: string;
  greetingName: string;
  lines: string[];
  ctaLabel: string;
  ctaUrl: string;
  unsubscribeUrl: string;
}) {
  const text = [
    `Hi ${input.greetingName},`,
    "",
    ...input.lines,
    "",
    `${input.ctaLabel}: ${input.ctaUrl}`,
    "",
    "To longer, healthier lives,",
    "The FursBliss Team",
    "",
    `Unsubscribe: ${input.unsubscribeUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <p>Hi ${escapeHtml(input.greetingName)},</p>
      ${input.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      <p>
        <a href="${input.ctaUrl}" style="display:inline-block;background:#0f766e;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:600;">
          ${escapeHtml(input.ctaLabel)}
        </a>
      </p>
      <p>To longer, healthier lives,<br/>The FursBliss Team</p>
      <p style="font-size:12px;color:#6b7280;">
        <a href="${input.unsubscribeUrl}" style="color:#6b7280;">Unsubscribe</a>
      </p>
    </div>
  `;

  return { subject: input.subject, text, html };
}

async function sentAnyEmailToday(enrollmentId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.emailSequenceStep.findFirst({
    where: {
      enrollmentId,
      status: "sent",
      sentAt: { gte: start },
    },
    select: { id: true },
  });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
  const startedAt = Date.now();
  const dueSteps = await getDueEmailSequenceSteps(MAX_STEPS_PER_RUN);

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let deferred = 0;

  for (let index = 0; index < dueSteps.length; index += 1) {
    if (Date.now() - startedAt >= MAX_RUNTIME_MS) {
      deferred = dueSteps.length - index;
      break;
    }

    const dueStep = dueSteps[index];
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
      const isPremium = isSubscriptionActive(user);

      if (isPremium && dueStep.step > 0) {
        skipped += 1;
        await completeEnrollmentById(enrollment.id);
        continue;
      }

      const alreadySentToday = await sentAnyEmailToday(enrollment.id);
      if (alreadySentToday) {
        deferred += 1;
        continue;
      }

      // Email throttling: Skip if any other email sent in past 24h OR weekly check-in completed in past 7 days
      const throttleCheck = await canSendEmail(user.id, "email-drip");
      if (!throttleCheck.canSend) {
        console.log(`[email-drip] Skipping ${user.email} step ${dueStep.step}: ${throttleCheck.reason}`);
        deferred += 1;
        continue;
      }

      const dogName = latestQuiz?.dogName ?? latestPet?.name ?? "your dog";
      const breed = latestQuiz?.breed ?? latestPet?.breed ?? "mixed breed";
      const age = latestQuiz?.age ?? latestPet?.age ?? 8;
      const score = latestQuiz?.score ?? 55;
      const firstName = firstNameOf(user.name);
      const trackingDays = latestPet ? await getTrackingDaysForPet(user.id, latestPet.id) : 0;
      const monthlyRecommendationsUsed = await getMonthlyRecommendationCount(user.id);
      const unsubscribeToken = createUnsubscribeToken({
        enrollmentId: enrollment.id,
        userId: user.id,
      });
      const unsubscribeUrl = `${appUrl}/api/email/unsubscribe?token=${encodeURIComponent(
        unsubscribeToken
      )}`;

      let template: ReturnType<typeof buildEmailTemplate> | null = null;
      const urgentCheckoutUrl = `${appUrl}/api/stripe/checkout?product=urgent&source=email-day${dueStep.step}`;
      const annualCheckoutUrl = `${appUrl}/api/stripe/checkout?plan=yearly&source=email-day10`;

      if (dueStep.step === 0) {
        template = buildEmailTemplate({
          subject: `The symptom most senior dog owners miss — ${dogName}'s health starts here`,
          greetingName: firstName,
          lines: [
            `I'm Greg. My 10-year-old Aussiedoodle Luna started slowing down on walks — and I almost wrote it off as "just getting older."`,
            `Turns out, subtle stiffness and hesitation on stairs can be early joint pain. Most owners miss it until it's harder to treat.`,
            `${dogName} deserves the same watchful eye. FursBliss helps you spot patterns before they become emergencies.`,
          ],
          ctaLabel: `Start tracking ${dogName}`,
          ctaUrl: `${appUrl}/dashboard`,
          unsubscribeUrl,
        });
      } else if (dueStep.step === 2) {
        template = buildEmailTemplate({
          subject: "73% of dogs over 7 have arthritis. Most owners think it's just aging.",
          greetingName: firstName,
          lines: [
            `For a ${age}-year-old ${breed} like ${dogName}, arthritis is more common than most people realize — about 73% of dogs over 7 show signs.`,
            `The tricky part: dogs rarely limp dramatically at first. They sleep more, skip stairs, or seem "lazy."`,
            `A 30-second daily log helps you catch the shift early — when small changes are still manageable.`,
          ],
          ctaLabel: `Log ${dogName}'s mobility today`,
          ctaUrl: `${appUrl}/dashboard`,
          unsubscribeUrl,
        });
      } else if (dueStep.step === 4) {
        template = buildEmailTemplate({
          subject: "Does your dog seem confused at night? This is why.",
          greetingName: firstName,
          lines: [
            `Cognitive decline in senior dogs often shows up at night — pacing, staring at walls, forgetting house rules.`,
            `It can look like anxiety, but it's often something vets can help with if you catch it early.`,
            `When something feels off and you need a faster answer than "wait and see," our Urgent Answer gives a vet-informed triage write-up in under 2 hours.`,
          ],
          ctaLabel: "Get an Urgent Answer — $24",
          ctaUrl: urgentCheckoutUrl,
          unsubscribeUrl,
        });
      } else if (dueStep.step === 7) {
        template = buildEmailTemplate({
          subject: "Dogs hide pain 10x better than humans. Here's how to catch it.",
          greetingName: firstName,
          lines: [
            `Dogs evolved to mask pain — it's survival instinct. By the time ${dogName} whimpers or limps badly, discomfort may have been building for weeks.`,
            `Watch for quiet signals: less tail wagging, avoiding favorite spots, eating slower, or panting without exercise.`,
            `Daily tracking turns those whispers into a timeline your vet can actually use.`,
          ],
          ctaLabel: `Check in on ${dogName}`,
          ctaUrl: `${appUrl}/check`,
          unsubscribeUrl,
        });
      } else if (dueStep.step === 10) {
        if (isPremium) {
          skipped += 1;
          await completeEnrollmentById(enrollment.id);
          continue;
        }
        template = buildEmailTemplate({
          subject: `Catching it at Stage 1 vs Stage 3 — ${dogName}'s window`,
          greetingName: firstName,
          lines: [
            `The difference between catching a senior dog health issue at Stage 1 vs Stage 3 is often months of comfort — and thousands in vet bills.`,
            `Premium ($9/month) keeps symptom history, trend alerts, and vet-ready reports in one place. Or save $29 vs monthly with our annual plan ($79/year).`,
            `Not sure tonight? Urgent Answer ($24 one-time) gets you a vet-informed triage response in under 2 hours — no subscription.`,
          ],
          ctaLabel: "Try Premium — 7-day free trial",
          ctaUrl: annualCheckoutUrl,
          unsubscribeUrl,
        });
      } else {
        skipped += 1;
        await markEmailSequenceStepSkipped(dueStep.id);
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
      
      // Log email send for throttling
      await logEmailSent(user.id, "email-drip");
      
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
    deferred,
    runtimeMs: Date.now() - startedAt,
  });
  } catch (error) {
    reportCronFailure("email-drip", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
