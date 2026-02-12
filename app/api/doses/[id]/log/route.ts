import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const logSchema = z.object({
  skipped: z.boolean().optional().default(false),
  notes: z.string().max(500).optional(),
});

type RouteProps = { params: { id: string } };

export async function POST(request: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const schedule = await prisma.doseSchedule.findFirst({
    where: { id: params.id, pet: { userId: session.user.id } },
    select: { id: true },
  });
  if (!schedule) {
    return NextResponse.json({ message: "Dose schedule not found" }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = logSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid log payload" }, { status: 400 });
  }

  const log = await prisma.doseCompletion.create({
    data: {
      scheduleId: schedule.id,
      skipped: parsed.data.skipped,
      notes: parsed.data.notes,
    },
  });

  await prisma.doseSchedule.update({
    where: { id: schedule.id },
    data: { lastCompletedAt: log.completedAt },
  });

  return NextResponse.json({ item: log });
}

