import { NextResponse } from "next/server";
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

      if (dueStep.step === 0) {
        template = buildEmailTemplate({
          subject: `${dogName}'s longevity score is ready — here's what it means`,
          greetingName: firstName,
          lines: [
            `Welcome to FursBliss! ${dogName}'s Longevity Readiness Score is ${score}/100.`,
            `Here's what that means for a ${breed} at age ${age}: ${scoreSummary(score, breed, age)}`,
            `The best way to improve ${dogName}'s score is daily health tracking. It takes about 30 seconds.`,
          ],
          ctaLabel: `Log ${dogName}'s First Health Check`,
          ctaUrl: `${appUrl}/dashboard`,
          unsubscribeUrl,
        });
      } else if (dueStep.step === 1) {
        if (trackingDays >= 1) {
          template = buildEmailTemplate({
            subject: "Day 1 done ✅ Here's what to watch for on Day 2",
            greetingName: firstName,
            lines: [
              `Great start — you logged ${dogName}'s first health check.`,
              `Quick Day 2 tip: watch energy levels. Is ${dogName} as active as usual or more tired than normal?`,
            ],
            ctaLabel: "Log Day 2",
            ctaUrl: `${appUrl}/dashboard`,
            unsubscribeUrl,
          });
        } else {
          template = buildEmailTemplate({
            subject: `${dogName} is waiting for you — log Day 1 (30 seconds)`,
            greetingName: firstName,
            lines: [
              `A quick Day 1 check starts ${dogName}'s baseline.`,
              "Once you begin tracking, we can give you smarter, more personalized guidance.",
            ],
            ctaLabel: `Log ${dogName}'s First Health Check`,
            ctaUrl: `${appUrl}/dashboard`,
            unsubscribeUrl,
          });
        }
      } else if (dueStep.step === 3) {
        if (trackingDays < 2) {
          skipped += 1;
          await markEmailSequenceStepSkipped(dueStep.id);
          await updateEnrollmentNextSendAt(enrollment.id);
          continue;
        }
        template = buildEmailTemplate({
          subject: `We spotted something in ${dogName}'s data`,
          greetingName: firstName,
          lines: [
            `With ${trackingDays} days of tracking, we're starting to see patterns in ${dogName}'s health data.`,
            `Your tracking consistency is building ${dogName}'s baseline health picture — exactly what vets want to see.`,
            `Keep going: at 7 days, you'll unlock your first personalized AI recommendation.`,
            `Progress: ${trackingDays}/7 days tracked.`,
          ],
          ctaLabel: "Log Today's Check",
          ctaUrl: `${appUrl}/dashboard`,
          unsubscribeUrl,
        });
      } else if (dueStep.step === 5) {
        if (trackingDays < 4) {
          skipped += 1;
          await markEmailSequenceStepSkipped(dueStep.id);
          await updateEnrollmentNextSendAt(enrollment.id);
          continue;
        }
        const risks = await prisma.breedProfile.findFirst({
          where: { breed },
          select: { commonHealthIssues: true },
        });
        const knownRiskCount = risks?.commonHealthIssues
          ? risks.commonHealthIssues.split(",").filter((item) => item.trim().length > 0).length
          : 3;

        template = buildEmailTemplate({
          subject: `2 more days until ${dogName}'s first AI insight`,
          greetingName: firstName,
          lines: [
            `You're almost there: ${trackingDays} days tracked.`,
            `At 7 days, ${dogName} gets a personalized AI recommendation using breed, age, and tracked patterns.`,
            `${dogName}'s breed (${breed}) has ${knownRiskCount} known health risks we'll keep watching.`,
            `Progress: ${trackingDays}/7 days.`,
          ],
          ctaLabel: `Log Day ${Math.min(7, trackingDays + 1)}`,
          ctaUrl: `${appUrl}/dashboard`,
          unsubscribeUrl,
        });
      } else if (dueStep.step === 7) {
        if (trackingDays >= 7) {
          template = buildEmailTemplate({
            subject: `${dogName}'s first AI recommendation is ready 🎉`,
            greetingName: firstName,
            lines: [
              "You did it.",
              `7 days of tracking are complete, and ${dogName}'s first personalized AI recommendation is waiting.`,
            ],
            ctaLabel: `See ${dogName}'s AI Recommendation`,
            ctaUrl: `${appUrl}/insights`,
            unsubscribeUrl,
          });
        } else {
          template = buildEmailTemplate({
            subject: `${Math.max(0, 7 - trackingDays)} days to go — keep tracking to unlock ${dogName}'s AI insight`,
            greetingName: firstName,
            lines: [
              `You're close: ${trackingDays}/7 days tracked.`,
              `Keep the streak going to unlock ${dogName}'s first AI insight.`,
            ],
            ctaLabel: "Log Today's Check",
            ctaUrl: `${appUrl}/dashboard`,
            unsubscribeUrl,
          });
        }
      } else if (dueStep.step === 10) {
        if (trackingDays < 7 || monthlyRecommendationsUsed < 1 || isPremium) {
          skipped += 1;
          await markEmailSequenceStepSkipped(dueStep.id);
          await updateEnrollmentNextSendAt(enrollment.id);
          continue;
        }

        template = buildEmailTemplate({
          subject: "You've seen what FursBliss can do — here's what Premium unlocks",
          greetingName: firstName,
          lines: [
            `Over the past ${trackingDays} days, you've tracked ${dogName}'s health and received your first AI insight.`,
            `Premium includes unlimited AI recommendations (you've used ${monthlyRecommendationsUsed} of 3 free), weekly trend reports, vet-ready reports, LOY-002 readiness tracking, and breed-specific longevity insights for ${breed}.`,
            "$9/month. Less than $0.30/day. Cancel anytime.",
            "Not ready yet? Your 3 free AI insights reset next month.",
          ],
          ctaLabel: `Upgrade ${dogName}'s Plan`,
          ctaUrl: `${appUrl}/pricing?plan=premium&from=email-day10`,
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
}
