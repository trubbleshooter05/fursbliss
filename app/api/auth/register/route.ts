import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createVerificationToken, generateReferralCode } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  password: z.string().min(6),
  referralCode: z.string().min(4).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const limiter = rateLimit(request, "auth-register", {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many registration attempts. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid registration details." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const referralCode = parsed.data.referralCode?.trim() ?? "";
    const resolvedReferralOwner = referralCode
      ? await prisma.user.findUnique({
          where: { referralCode: referralCode.toUpperCase() },
        })
      : null;

    const rewardDurationMs = 30 * 24 * 60 * 60 * 1000;
    const referralRewardEndsAt = new Date(Date.now() + rewardDurationMs);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        password: hashedPassword,
        referralCode: generateReferralCode(),
        referredById: resolvedReferralOwner?.id,
        ...(resolvedReferralOwner
          ? {
              subscriptionStatus: "premium",
              subscriptionPlan: "referral",
              subscriptionEndsAt: referralRewardEndsAt,
            }
          : {}),
      },
    });

    if (resolvedReferralOwner) {
      await prisma.referral.create({
        data: {
          code: resolvedReferralOwner.referralCode ?? "",
          userId: resolvedReferralOwner.id,
          invitedEmail: user.email,
          redeemedById: user.id,
          redeemedAt: new Date(),
        },
      });

      const referrer = await prisma.user.findUnique({
        where: { id: resolvedReferralOwner.id },
        select: {
          subscriptionStatus: true,
          subscriptionPlan: true,
          subscriptionEndsAt: true,
        },
      });

      const isPaidPlan =
        referrer?.subscriptionStatus === "premium" &&
        referrer.subscriptionPlan &&
        referrer.subscriptionPlan !== "referral";

      if (!isPaidPlan) {
        const baseDate =
          referrer?.subscriptionEndsAt &&
          referrer.subscriptionEndsAt.getTime() > Date.now()
            ? referrer.subscriptionEndsAt
            : new Date();
        const nextEndsAt = new Date(baseDate.getTime() + rewardDurationMs);

        await prisma.user.update({
          where: { id: resolvedReferralOwner.id },
          data: {
            subscriptionStatus: "premium",
            subscriptionPlan: "referral",
            subscriptionEndsAt: nextEndsAt,
          },
        });
      }
    }

    await prisma.quizSubmission.updateMany({
      where: { email: user.email, userId: null },
      data: { userId: user.id },
    });

    const verificationToken = await createVerificationToken(user.email);
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
    const emailResult = await sendVerificationEmail(user.email, verifyUrl);

    console.info("[Meta CAPI] register route reached; sending CompleteRegistration", {
      email: user.email,
    });
    await sendMetaConversionEvent({
      eventName: "CompleteRegistration",
      email: user.email,
      request,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      verificationUrl: emailResult.queued ? null : verifyUrl,
    });
  } catch (error) {
    console.error("Registration error", error);
    return NextResponse.json(
      { message: "Unable to create account right now." },
      { status: 500 }
    );
  }
}
