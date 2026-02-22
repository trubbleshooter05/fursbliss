import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";
import { getRetryAfterSeconds, rateLimit } from "@/lib/rate-limit";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
});

export async function POST(request: Request) {
  const limiter = rateLimit(request, "auth-resend-verification", {
    limit: 3,
    windowMs: 60_000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many resend attempts. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
        },
      }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Enter a valid email." }, { status: 400 });
  }

  const email = parsed.data.email;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.json({
      ok: true,
      message: "If that account exists, a verification email has been sent.",
    });
  }

  if (user.emailVerified) {
    return NextResponse.json({
      ok: true,
      message: "This email is already verified. You can sign in now.",
    });
  }

  const verificationToken = await createVerificationToken(user.email);
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
  const emailResult = await sendVerificationEmail(user.email, verifyUrl);

  return NextResponse.json({
    ok: true,
    message: "We sent a new verification email.",
    verificationUrl: emailResult.queued ? null : verifyUrl,
  });
}
