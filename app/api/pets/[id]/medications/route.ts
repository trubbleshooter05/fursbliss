import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
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

  const medication = await prisma.medication.create({
    data: {
      petId: pet.id,
      name: parsed.data.name,
      dosage: parsed.data.dosage,
      frequency: parsed.data.frequency,
    },
  });

  return NextResponse.json(medication);
}
