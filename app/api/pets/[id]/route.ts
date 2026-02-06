import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const petSchema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  age: z.number().int().min(0),
  weight: z.number().min(0),
  symptoms: z.array(z.string()).optional().default([]),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

type RouteParams = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = petSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid pet data" }, { status: 400 });
    }

    const existingPet = await prisma.pet.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existingPet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    const pet = await prisma.pet.update({
      where: { id: params.id },
      data: {
        name: parsed.data.name,
        breed: parsed.data.breed,
        age: parsed.data.age,
        weight: parsed.data.weight,
        symptoms: parsed.data.symptoms,
        photoUrl: parsed.data.photoUrl || null,
      },
    });

    return NextResponse.json(pet);
  } catch (error) {
    console.error("Update pet error", error);
    return NextResponse.json(
      { message: "Unable to update pet" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingPet = await prisma.pet.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existingPet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    await prisma.pet.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete pet error", error);
    return NextResponse.json(
      { message: "Unable to delete pet" },
      { status: 500 }
    );
  }
}
