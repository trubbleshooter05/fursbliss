import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  supplementName: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  times: z.array(z.string()).optional().default([]),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().default([]),
  notes: z.string().optional(),
});

type RouteParams = { params: { id: string } };

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const schedule = await prisma.doseSchedule.create({
    data: {
      petId: pet.id,
      supplementName: parsed.data.supplementName,
      dosage: parsed.data.dosage,
      frequency: parsed.data.frequency,
      times: parsed.data.times,
      daysOfWeek:
        parsed.data.daysOfWeek.length > 0
          ? parsed.data.daysOfWeek.join(",")
          : null,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json(schedule);
}
