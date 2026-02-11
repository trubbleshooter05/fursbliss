import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const requestSchema = z.object({
  email: z.string().trim().email().max(320),
});

function resolveTeamEmail() {
  const configured = process.env.LOY_NOTIFY_TO_EMAIL;
  if (configured && configured.includes("@")) {
    return configured;
  }

  const resendFrom = process.env.RESEND_FROM_EMAIL ?? "";
  const match = resendFrom.match(/<([^>]+)>/);
  if (match?.[1]) {
    return match[1];
  }

  return "hello@fursbliss.com";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Please provide a valid email." }, { status: 400 });
  }

  const { email } = parsed.data;
  const teamEmail = resolveTeamEmail();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";

  await Promise.all([
    sendEmail({
      to: teamEmail,
      subject: "New LOY update request",
      text: `New LOY notify request: ${email}`,
      html: `<p>New LOY notify request: <strong>${email}</strong></p>`,
    }),
    sendEmail({
      to: email,
      subject: "You're on the FursBliss LOY update list",
      text: `Thanks for joining. We'll email you when there is a major LOY status update.\n\nOpen FursBliss: ${appUrl}/longevity-drugs`,
      html: `<div style="font-family: Arial, sans-serif; color: #111827;">
        <h2>You're on the LOY update list</h2>
        <p>Thanks for joining. We'll email you when there is a major LOY status update.</p>
        <p><a href="${appUrl}/longevity-drugs" style="color:#059669;font-weight:600;">Open Drug Hub</a></p>
      </div>`,
    }),
  ]);

  return NextResponse.json({ success: true });
}
