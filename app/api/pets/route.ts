import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!isSubscriptionActive(user)) {
      const petCount = await prisma.pet.count({
        where: { userId: session.user.id },
      });

      if (petCount >= 1) {
        return NextResponse.json(
          { message: "Free tier supports 1 pet profile. Upgrade for more." },
          { status: 403 }
        );
      }
    }

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
