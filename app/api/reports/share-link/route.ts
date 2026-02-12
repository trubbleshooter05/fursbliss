import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

const requestSchema = z.object({
  petId: z.string().min(1),
  expiresInDays: z.number().int().min(1).max(180).optional(),
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

  const expiresInDays = parsed.data.expiresInDays ?? 30;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  const link = await prisma.vetShareLink.create({
    data: {
      petId: pet.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    id: link.id,
    url: `/vet-view/${link.token}`,
    expiresAt: link.expiresAt,
  });
}

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

  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: session.user.id },
    select: { id: true },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const links = await prisma.vetShareLink.findMany({
    where: { petId: pet.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      token: true,
      expiresAt: true,
      viewCount: true,
      createdAt: true,
      vetComment: true,
    },
    take: 15,
  });

  return NextResponse.json({
    links: links.map((link) => ({
      id: link.id,
      token: link.token,
      expiresAt: link.expiresAt,
      viewCount: link.viewCount,
      createdAt: link.createdAt,
      vetComment: link.vetComment,
      url: `/vet-view/${link.token}`,
      isExpired: link.expiresAt.getTime() < Date.now(),
    })),
  });
}

const deleteSchema = z.object({
  linkId: z.string().min(1),
});

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  const link = await prisma.vetShareLink.findFirst({
    where: {
      id: parsed.data.linkId,
      pet: { userId: session.user.id },
    },
    select: { id: true },
  });
  if (!link) {
    return NextResponse.json({ message: "Link not found" }, { status: 404 });
  }

  await prisma.vetShareLink.delete({ where: { id: link.id } });
  return NextResponse.json({ success: true });
}
