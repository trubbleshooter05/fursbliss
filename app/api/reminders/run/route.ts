import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const logCountToday = await prisma.healthLog.count({
    where: {
      pet: { userId: session.user.id },
      date: { gte: today },
    },
  });

  const schedules = await prisma.doseSchedule.findMany({
    where: { pet: { userId: session.user.id }, active: true },
    include: { pet: true },
  });

  const notifications = schedules.map((schedule) => ({
    userId: session.user.id,
    title: `Dose reminder for ${schedule.pet.name}`,
    body: `Give ${schedule.supplementName} (${schedule.dosage}) today.`,
  }));

  if (logCountToday === 0) {
    notifications.push({
      userId: session.user.id,
      title: "Daily log reminder",
      body: "Log your pet's wellness check for today.",
    });
  }

  if (notifications.length === 0) {
    return NextResponse.json({ created: 0 });
  }

  await prisma.notification.createMany({ data: notifications });

  return NextResponse.json({ created: notifications.length });
}
