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

export async function POST(request: Request) {
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

    const pet = await prisma.pet.create({
      data: {
        userId: session.user.id,
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
    console.error("Create pet error", error);
    return NextResponse.json(
      { message: "Unable to create pet" },
      { status: 500 }
    );
  }
}
