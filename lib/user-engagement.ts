import { prisma } from "@/lib/prisma";

function startOfCurrentMonth() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getTrackingDaysForPet(userId: string, petId: string) {
  const logs = await prisma.healthLog.findMany({
    where: {
      petId,
      pet: { userId },
    },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  return new Set(logs.map((log) => toDayKey(log.date))).size;
}

export async function getTrackingDaysByPet(userId: string) {
  const logs = await prisma.healthLog.findMany({
    where: { pet: { userId } },
    select: { petId: true, date: true },
    orderBy: { date: "asc" },
  });

  const byPet = new Map<string, Set<string>>();
  for (const log of logs) {
    const existing = byPet.get(log.petId) ?? new Set<string>();
    existing.add(toDayKey(log.date));
    byPet.set(log.petId, existing);
  }

  const result: Record<string, number> = {};
  for (const [petId, days] of Array.from(byPet.entries())) {
    result[petId] = days.size;
  }
  return result;
}

export async function getMonthlyRecommendationCount(userId: string) {
  const monthStart = startOfCurrentMonth();
  return prisma.recommendation.count({
    where: {
      pet: { userId },
      createdAt: { gte: monthStart },
    },
  });
}

export function nextMonthlyResetDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
