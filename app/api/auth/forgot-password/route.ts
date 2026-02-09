import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/auth-tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const limiter = rateLimit(request, "auth-forgot-password", {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many requests. Try again shortly." },
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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = await createPasswordResetToken(user.email);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({
      success: true,
      resetUrl: emailResult.queued ? null : resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error", error);
    return NextResponse.json(
      { message: "Unable to process request" },
      { status: 500 }
    );
  }
}
