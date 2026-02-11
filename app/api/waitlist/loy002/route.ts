import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
});

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
}

function toDebugString(err: unknown) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return `Prisma(${err.code}): ${err.message}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

async function maybeSendConfirmationEmail(email: string) {
  if (!process.env.RESEND_API_KEY) {
    return;
  }

  try {
    await sendEmail({
      to: email,
      subject: "You are on the LOY-002 updates list",
      text: `Thanks for joining the FursBliss LOY-002 waitlist.\n\nWe will notify you about approval milestones, manufacturing updates, and potential availability timelines.\n\nTrack updates: ${appUrl()}/longevity-drugs`,
      html: `<div style="font-family: Arial, sans-serif; color: #111827;">
        <h2>You are on the LOY-002 updates list</h2>
        <p>Thanks for joining the FursBliss waitlist.</p>
        <p>We will notify you about approval milestones, manufacturing updates, and potential availability timelines.</p>
        <p><a href="${appUrl()}/longevity-drugs" style="color:#059669;font-weight:600;">Track LOY-002 updates</a></p>
      </div>`,
    });
  } catch {
    // Optional delivery only; signup should still succeed.
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email;

  try {
    await prisma.waitlistSignup.create({
      data: {
        email,
        source: "loy002",
      },
    });
    await maybeSendConfirmationEmail(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LOY002 waitlist error", err);

    const prismaError =
      err instanceof Prisma.PrismaClientKnownRequestError ? err : null;
    if (prismaError?.code === "P2002") {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const debug = toDebugString(err);

    return NextResponse.json(
      isProduction
        ? { ok: false, message: "Unable to save waitlist signup" }
        : { ok: false, message: "Unable to save waitlist signup", debug },
      { status: 500 }
    );
  }
}
