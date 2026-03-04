import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  urgencyLevel: z.enum(["EMERGENCY_NOW", "VET_TODAY", "VET_SOON", "HOME_MONITOR"]),
  urgencyReason: z.string().trim().min(1).max(400),
  symptoms: z.string().trim().min(1).max(2000),
});

function urgencyCopy(level: string) {
  if (level === "EMERGENCY_NOW") return "Go to the ER now";
  if (level === "VET_TODAY") return "See your vet within 24 hours";
  if (level === "VET_SOON") return "Schedule a vet visit this week";
  return "Safe to monitor at home";
}

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

  const urgencyLabel = urgencyCopy(parsed.data.urgencyLevel);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";

  if (process.env.RESEND_API_KEY) {
    await sendEmail({
      to: parsed.data.email,
      subject: `Your FursBliss triage result: ${urgencyLabel}`,
      text: `Triage urgency: ${urgencyLabel}\nReason: ${parsed.data.urgencyReason}\nSymptoms: ${parsed.data.symptoms}\n\nImportant: This is informational only and not a veterinary diagnosis. If symptoms worsen, seek emergency veterinary care immediately.\n\nRun triage again: ${appUrl}/triage`,
      html: `<div style="font-family: Arial, sans-serif; color: #111827;">
        <h2>Your FursBliss triage result</h2>
        <p><strong>Urgency:</strong> ${urgencyLabel}</p>
        <p><strong>Reason:</strong> ${parsed.data.urgencyReason}</p>
        <p><strong>Symptoms submitted:</strong> ${parsed.data.symptoms}</p>
        <p style="font-size: 12px; color: #6B7280;">
          Informational only — not a veterinary diagnosis. If symptoms worsen, seek emergency veterinary care.
        </p>
        <p><a href="${appUrl}/triage" style="color:#0D6E6E;font-weight:600;">Open triage tool</a></p>
      </div>`,
    });
  }

  const metaEventId = randomUUID();
  await sendMetaConversionEvent({
    eventName: "Lead",
    email: parsed.data.email,
    request,
    eventId: metaEventId,
  });

  return NextResponse.json({ success: true, metaEventId });
}
