import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  sessionId: z.string().min(8).max(120),
  stepNumber: z.number().int().min(1).max(10),
  stepName: z.string().min(1).max(64),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid step event payload" }, { status: 400 });
  }

  const { sessionId, stepNumber, stepName } = parsed.data;

  try {
    await prisma.quizStepEvent.create({
      data: {
        sessionId,
        stepNumber,
        stepName,
      },
    });
  } catch (error) {
    // Keep quiz flow non-blocking even if analytics write fails.
    console.error("Quiz step event write failed", {
      sessionId,
      stepNumber,
      stepName,
      error,
    });
  }

  return NextResponse.json({ ok: true });
}
