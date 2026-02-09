import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  scheduleId: z.string().min(1),
  skipped: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  const schedule = await prisma.doseSchedule.findFirst({
    where: { id: parsed.data.scheduleId, pet: { userId: session.user.id } },
  });

  if (!schedule) {
    return NextResponse.json({ message: "Schedule not found" }, { status: 404 });
  }

  const completion = await prisma.doseCompletion.create({
    data: {
      scheduleId: schedule.id,
      skipped: parsed.data.skipped ?? false,
      notes: parsed.data.notes,
    },
  });

  await prisma.doseSchedule.update({
    where: { id: schedule.id },
    data: { lastCompletedAt: completion.completedAt },
  });

  return NextResponse.json(completion);
}
