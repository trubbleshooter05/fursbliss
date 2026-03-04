import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createVerificationToken, generateReferralCode } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";
import { enrollUserInWelcomeSequence } from "@/lib/email/sequence";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  name: z.string().min(1).optional(),
  password: z.string().min(6),
  referralCode: z.string().min(4).optional().or(z.literal("")),
  quizSnapshot: z
    .object({
      dogName: z.string().min(1).max(64).optional(),
      breed: z.string().min(2).max(80),
      age: z.number().int().min(1).max(30),
      weight: z.number().min(1).max(400),
      concerns: z.array(z.string()).max(8).optional().default([]),
    })
    .nullable()
    .optional(),
  checkoutSessionId: z.string().trim().min(1).optional(),
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

    let checkoutSessionData:
      | {
          customerId: string | null;
          subscriptionId: string | null;
          subscriptionPlan: "monthly" | "yearly";
        }
      | null = null;

    if (parsed.data.checkoutSessionId) {
      const session = await stripe.checkout.sessions.retrieve(parsed.data.checkoutSessionId, {
        expand: ["subscription"],
      });
      const checkoutEmail = session.customer_details?.email?.trim().toLowerCase();
      if (!checkoutEmail || checkoutEmail !== parsed.data.email) {
        return NextResponse.json(
          {
            message:
              "Please use the same email used during checkout so we can activate your premium plan.",
          },
          { status: 400 }
        );
      }
      if (session.status !== "complete") {
        return NextResponse.json(
          { message: "Checkout is not complete yet. Please complete payment first." },
          { status: 400 }
        );
      }

      const subscription =
        typeof session.subscription === "string"
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;
      const interval = subscription?.items.data[0]?.price?.recurring?.interval;
      checkoutSessionData = {
        customerId:
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        subscriptionId: subscription?.id ?? null,
        subscriptionPlan: interval === "year" ? "yearly" : "monthly",
      };
    }

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
        ...(checkoutSessionData
          ? {
              stripeCustomerId: checkoutSessionData.customerId ?? undefined,
              subscriptionStatus: "premium",
              subscriptionPlan: checkoutSessionData.subscriptionPlan,
              subscriptionId: checkoutSessionData.subscriptionId ?? undefined,
              subscriptionEndsAt: null,
            }
          : {}),
      },
    });

    // Mirror the Lead flow: fire CAPI with request context on successful create.
    const metaEventId = randomUUID();
    console.info("[Meta CAPI] register route reached; sending CompleteRegistration", {
      email: user.email,
      metaEventId,
    });
    await sendMetaConversionEvent({
      eventName: "CompleteRegistration",
      email: user.email,
      request,
      eventId: metaEventId,
    });

    if (parsed.data.quizSnapshot) {
      const snapshot = parsed.data.quizSnapshot;
      await prisma.pet.create({
        data: {
          userId: user.id,
          name: snapshot.dogName?.trim() || "My Dog",
          breed: snapshot.breed,
          age: snapshot.age,
          weight: snapshot.weight,
          symptoms: snapshot.concerns,
        },
      });
    }

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

    const linkedQuizResults = await prisma.quizSubmission.updateMany({
      where: { email: user.email, userId: null },
      data: { userId: user.id },
    });

    const hasLinkedQuiz =
      linkedQuizResults.count > 0 ||
      (await prisma.quizSubmission.count({
        where: { userId: user.id },
      })) > 0;

    if (hasLinkedQuiz) {
      await enrollUserInWelcomeSequence(user.id);
    }

    const verificationToken = await createVerificationToken(user.email);
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
    const emailResult = await sendVerificationEmail(user.email, verifyUrl);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      verificationUrl: emailResult.queued ? null : verifyUrl,
      metaEventId,
    });
  } catch (error) {
    console.error("Registration error", error);
    return NextResponse.json(
      { message: "Unable to create account right now." },
      { status: 500 }
    );
  }
}
