import { NextResponse } from "next/server";
import {
  pauseEnrollmentById,
  unsubscribeEnrollmentById,
} from "@/lib/email/sequence";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
  const payload = (await request.json()) as Record<string, unknown>;
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
      payloadJson: payload,
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
