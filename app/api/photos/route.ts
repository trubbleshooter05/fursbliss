import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const photoSchema = z.object({
  petId: z.string().min(1),
  imageUrl: z.string().url(),
  category: z.string().optional(),
  caption: z.string().optional(),
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

  const photos = await prisma.photoLog.findMany({
    where: { petId, pet: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(photos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = photoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid photo data" }, { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: parsed.data.petId, userId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const photo = await prisma.photoLog.create({
    data: {
      petId: parsed.data.petId,
      imageUrl: parsed.data.imageUrl,
      category: parsed.data.category,
      caption: parsed.data.caption,
    },
  });

  return NextResponse.json(photo);
}
