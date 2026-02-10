import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = now.getDay();

  const schedules = await prisma.doseSchedule.findMany({
    where: {
      active: true,
      pet: { userId: session.user.id },
    },
    include: {
      pet: { select: { id: true, name: true } },
      doseCompletions: {
        where: { completedAt: { gte: startOfDay } },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const dueToday = schedules
    .filter((schedule) => isDueToday(schedule.frequency, schedule.daysOfWeek, dayOfWeek))
    .map((schedule) => {
      const todayCompletion = schedule.doseCompletions[0];
      return {
        id: schedule.id,
        petId: schedule.pet.id,
        petName: schedule.pet.name,
        supplementName: schedule.supplementName,
        dosage: schedule.dosage,
        frequency: schedule.frequency,
        times: schedule.times,
        status: todayCompletion
          ? todayCompletion.skipped
            ? "skipped"
            : "completed"
          : "due",
      };
    });

  return NextResponse.json({ items: dueToday });
}

function isDueToday(
  frequency: string,
  daysOfWeek: string | null,
  dayOfWeek: number
) {
  const normalized = frequency.toLowerCase();
  if (normalized.includes("daily")) {
    return true;
  }
  if (normalized.includes("weekly")) {
    const parsedDays = parseDays(daysOfWeek);
    if (parsedDays.length === 0) {
      return dayOfWeek === 1;
    }
    return parsedDays.includes(dayOfWeek);
  }
  return true;
}

function parseDays(value: string | null) {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
}
