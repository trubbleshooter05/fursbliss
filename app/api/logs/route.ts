import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const logSchema = z.object({
  petId: z.string().min(1),
  date: z.string().min(1),
  energyLevel: z.number().min(1).max(10),
  weight: z.number().min(0).optional(),
  appetite: z.string().optional(),
  mood: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  improvements: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = logSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid log data" }, { status: 400 });
    }

    const pet = await prisma.pet.findFirst({
      where: { id: parsed.data.petId, userId: session.user.id },
    });

    if (!pet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    const log = await prisma.healthLog.create({
      data: {
        petId: parsed.data.petId,
        date: new Date(parsed.data.date),
        energyLevel: parsed.data.energyLevel,
        weight: parsed.data.weight,
        appetite: parsed.data.appetite,
        mood: parsed.data.mood,
        notes: parsed.data.notes,
        photoUrl: parsed.data.photoUrl || null,
        improvements: parsed.data.improvements ?? false,
      },
    });

    if (parsed.data.weight) {
      await prisma.weightLog.create({
        data: {
          petId: parsed.data.petId,
          date: new Date(parsed.data.date),
          weight: parsed.data.weight,
        },
      });
    }

    if (parsed.data.photoUrl) {
      await prisma.photoLog.create({
        data: {
          petId: parsed.data.petId,
          healthLogId: log.id,
          imageUrl: parsed.data.photoUrl,
        },
      });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("Create log error", error);
    return NextResponse.json(
      { message: "Unable to create log" },
      { status: 500 }
    );
  }
}
