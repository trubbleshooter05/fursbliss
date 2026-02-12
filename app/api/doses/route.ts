import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

const createSchema = z.object({
  petId: z.string().min(1),
  supplement: z.string().min(1),
  doseMg: z.number().min(1).optional(),
  frequency: z.enum(["daily", "twice_daily", "weekly"]).default("daily"),
  timeOfDay: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .default("08:00"),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const petId = searchParams.get("petId");

  const schedules = await prisma.doseSchedule.findMany({
    where: {
      pet: { userId: session.user.id },
      ...(petId ? { petId } : {}),
    },
    include: {
      pet: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: schedules });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid dose schedule" }, { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: parsed.data.petId, userId: session.user.id },
    select: { id: true },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });
  const isPremium = user ? isSubscriptionActive(user) : false;
  if (!isPremium) {
    const existingCount = await prisma.doseSchedule.count({
      where: { pet: { userId: session.user.id }, active: true },
    });
    if (existingCount >= 1) {
      return NextResponse.json(
        { message: "Upgrade to Premium to add more than one active dose schedule." },
        { status: 403 }
      );
    }
  }

  const schedule = await prisma.doseSchedule.create({
    data: {
      petId: pet.id,
      supplementName: parsed.data.supplement,
      dosage: parsed.data.doseMg ? `${parsed.data.doseMg} mg` : "As directed",
      frequency: parsed.data.frequency,
      times: [parsed.data.timeOfDay],
      scheduledTime: parsed.data.timeOfDay,
    },
    include: {
      pet: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ item: schedule });
}

