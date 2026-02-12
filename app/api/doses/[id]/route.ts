import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  supplement: z.string().min(1).optional(),
  doseMg: z.number().min(1).optional(),
  frequency: z.enum(["daily", "twice_daily", "weekly"]).optional(),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  active: z.boolean().optional(),
});

type RouteProps = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.doseSchedule.findFirst({
    where: { id: params.id, pet: { userId: session.user.id } },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Dose schedule not found" }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid update payload" }, { status: 400 });
  }

  const updated = await prisma.doseSchedule.update({
    where: { id: params.id },
    data: {
      supplementName: parsed.data.supplement,
      dosage: parsed.data.doseMg ? `${parsed.data.doseMg} mg` : undefined,
      frequency: parsed.data.frequency,
      times: parsed.data.timeOfDay ? [parsed.data.timeOfDay] : undefined,
      scheduledTime: parsed.data.timeOfDay,
      active: parsed.data.active,
    },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.doseSchedule.findFirst({
    where: { id: params.id, pet: { userId: session.user.id } },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ message: "Dose schedule not found" }, { status: 404 });
  }

  await prisma.doseSchedule.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

