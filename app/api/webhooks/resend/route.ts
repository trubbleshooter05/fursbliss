import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { Prisma } from "@prisma/client";
import {
  pauseEnrollmentById,
  unsubscribeEnrollmentById,
} from "@/lib/email/sequence";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeEventType(payload: Record<string, unknown>) {
  const raw =
    (typeof payload.type === "string" && payload.type) ||
    (typeof payload.event === "string" && payload.event) ||
    (typeof payload["event_type"] === "string" && (payload["event_type"] as string)) ||
    "unknown";
  return raw.toLowerCase();
}

function normalizeMessageId(payload: Record<string, unknown>) {
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const candidates = [
    payload.message_id,
    payload.messageId,
    payload.email_id,
    data.message_id,
    data.id,
    data.email_id,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return "";
}

function normalizeEventAt(payload: Record<string, unknown>) {
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const candidate =
    (typeof payload.created_at === "string" && payload.created_at) ||
    (typeof data.created_at === "string" && data.created_at) ||
    null;
  const parsed = candidate ? new Date(candidate) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function POST(request: Request) {
  const signingSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!signingSecret) {
    console.error("RESEND_WEBHOOK_SECRET is not configured; rejecting webhook.");
    return NextResponse.json({ message: "Webhook not configured" }, { status: 500 });
  }

  // Verify the Svix signature over the RAW body (Resend signs via Svix).
  const rawBody = await request.text();
  let payload: Record<string, unknown>;
  try {
    const wh = new Webhook(signingSecret);
    payload = wh.verify(rawBody, {
      "svix-id": request.headers.get("svix-id") ?? "",
      "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
      "svix-signature": request.headers.get("svix-signature") ?? "",
    }) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  const eventType = normalizeEventType(payload);
  const messageId = normalizeMessageId(payload);
  const eventAt = normalizeEventAt(payload);

  if (!messageId) {
    return NextResponse.json({ message: "Missing message id" }, { status: 400 });
  }

  await prisma.emailEvent.create({
    data: {
      messageId,
      eventType,
      eventAt,
      payloadJson: toPrismaJson(payload),
    },
  });

  const step = await prisma.emailSequenceStep.findFirst({
    where: { resendMessageId: messageId },
    include: { enrollment: true },
  });

  if (step) {
    if (eventType.includes("complain")) {
      await unsubscribeEnrollmentById(step.enrollmentId);
    } else if (eventType.includes("bounce")) {
      await pauseEnrollmentById(step.enrollmentId);
    }
  }

  return NextResponse.json({ ok: true });
}
