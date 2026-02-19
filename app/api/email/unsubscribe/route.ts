import { NextResponse } from "next/server";
import { parseUnsubscribeToken } from "@/lib/email/unsubscribe";
import { unsubscribeEnrollmentById } from "@/lib/email/sequence";
import { prisma } from "@/lib/prisma";

function buildSuccessRedirectUrl(request: Request) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  return `${base}/account?email_unsubscribed=1`;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }

  const parsed = parseUnsubscribeToken(token);
  if (!parsed) {
    return NextResponse.json({ message: "Invalid unsubscribe token" }, { status: 400 });
  }

  const enrollment = await prisma.emailSequenceEnrollment.findUnique({
    where: { id: parsed.enrollmentId },
    select: { id: true, userId: true },
  });

  if (!enrollment || enrollment.userId !== parsed.userId) {
    return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });
  }

  await unsubscribeEnrollmentById(enrollment.id);
  return NextResponse.redirect(buildSuccessRedirectUrl(request));
}

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  if (!body?.token) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }

  const parsed = parseUnsubscribeToken(body.token);
  if (!parsed) {
    return NextResponse.json({ message: "Invalid unsubscribe token" }, { status: 400 });
  }

  const enrollment = await prisma.emailSequenceEnrollment.findUnique({
    where: { id: parsed.enrollmentId },
    select: { id: true, userId: true },
  });

  if (!enrollment || enrollment.userId !== parsed.userId) {
    return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });
  }

  await unsubscribeEnrollmentById(enrollment.id);
  return NextResponse.json({ ok: true });
}
