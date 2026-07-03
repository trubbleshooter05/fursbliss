import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const requestSchema = z.object({
  submissionId: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email().max(320),
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
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const limiter = rateLimit(request, "quiz-capture-email", {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)) } }
    );
  }

  const updatedSubmission = await prisma.quizSubmission.update({
    where: { id: parsed.data.submissionId },
    data: { email: parsed.data.email },
    select: {
      id: true,
      email: true,
      dogName: true,
      score: true,
    },
  }).catch(() => null);

  if (!updatedSubmission) {
    return NextResponse.json({ message: "Quiz submission not found." }, { status: 404 });
  }

  if (process.env.RESEND_API_KEY) {
    const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
    await sendEmail({
      to: updatedSubmission.email,
      subject: `${updatedSubmission.dogName}'s Longevity Readiness Score: ${updatedSubmission.score}/100`,
      text: `Your readiness score is ${updatedSubmission.score}/100.\n\nView full recommendations: ${baseAppUrl}/quiz/results/${updatedSubmission.id}`,
      html: `<div style="font-family: Arial, sans-serif; color: #111827;">
        <h2>${updatedSubmission.dogName}'s Longevity Readiness Score: ${updatedSubmission.score}/100</h2>
        <p>Thanks for taking the FursBliss quiz.</p>
        <p><a href="${baseAppUrl}/quiz/results/${updatedSubmission.id}" style="color:#0D6E6E;font-weight:600;">View your full results</a></p>
      </div>`,
    });
  }

  const metaEventId = randomUUID();
  await sendMetaConversionEvent({
    eventName: "Lead",
    email: updatedSubmission.email,
    request,
    eventId: metaEventId,
  });

  return NextResponse.json({
    success: true,
    metaEventId,
  });
}
