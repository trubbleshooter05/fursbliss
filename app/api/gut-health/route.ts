import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const gutSchema = z.object({
  petId: z.string().min(1),
  stoolQuality: z.number().min(1).max(7),
  stoolNotes: z.string().optional(),
  gasLevel: z.number().min(1).max(5).optional(),
  vomiting: z.boolean().optional().default(false),
  appetiteChange: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const petId = searchParams.get("petId");
  if (!petId) {
    return NextResponse.json({ message: "petId is required" }, { status: 400 });
  }

  const logs = await prisma.gutHealthLog.findMany({
    where: { petId, pet: { userId: session.user.id } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = gutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid gut health data" }, { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: parsed.data.petId, userId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const log = await prisma.gutHealthLog.create({
    data: {
      petId: parsed.data.petId,
      stoolQuality: parsed.data.stoolQuality,
      stoolNotes: parsed.data.stoolNotes,
      gasLevel: parsed.data.gasLevel,
      vomiting: parsed.data.vomiting ?? false,
      appetiteChange: parsed.data.appetiteChange,
    },
  });

  return NextResponse.json(log);
}
