import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

const requestSchema = z.object({
  petId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (!isSubscriptionActive(user)) {
    return NextResponse.json(
      { message: "Vet share links are a premium feature." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: parsed.data.petId, userId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const link = await prisma.vetShareLink.create({
    data: {
      petId: pet.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    url: `/vet-view/${link.token}`,
    expiresAt: link.expiresAt,
  });
}
