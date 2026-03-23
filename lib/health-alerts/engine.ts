import { subDays, startOfDay } from "date-fns";
import type { HealthLog, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TrendMetric = "mobility" | "appetite" | "energy";

const TREND_ALERT = "trend_decline";
const BREED_RISK_ALERT = "breed_risk";
const SYMPTOM_PATTERN_ALERT = "symptom_pattern";

function startOfDayUtc(d: Date) {
  return startOfDay(d);
}

function getMetricValue(log: HealthLog, metric: TrendMetric): number | null {
  if (metric === "energy") return log.energyLevel;
  if (metric === "mobility") return log.mobilityLevel ?? null;
  if (metric === "appetite") return log.appetiteLevel ?? null;
  return null;
}

function avgMetric(logs: HealthLog[], metric: TrendMetric): number | null {
  const vals = logs.map((l) => getMetricValue(l, metric)).filter((v): v is number => v != null && !Number.isNaN(v));
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function pctDrop(prevAvg: number, currAvg: number): number {
  if (prevAvg <= 0) return 0;
  return ((prevAvg - currAvg) / prevAvg) * 100;
}

function parseSymptoms(symptoms: string | null | undefined): string[] {
  if (!symptoms?.trim()) return [];
  return symptoms
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function hasRecentTrendDup(
  petId: string,
  metric: TrendMetric,
  since: Date
): Promise<boolean> {
  const existing = await prisma.healthAlert.findFirst({
    where: {
      petId,
      alertType: TREND_ALERT,
      metric,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return !!existing;
}

function normalizeBreedName(breed: string): string {
  const t = breed.trim();
  if (!t) return "Mixed Breed";
  return t;
}

async function resolveBreedRisks(breedRaw: string) {
  const breed = normalizeBreedName(breedRaw);
  const all = await prisma.breedHealthRisk.findMany();
  const exact = all.filter((r) => r.breed.toLowerCase() === breed.toLowerCase());
  if (exact.length) return exact;
  return all.filter((r) => r.breed === "Mixed Breed");
}

const JOINT_KEYWORDS = ["hip", "joint", "arthritis", "myelopathy", "ivdd", "disc", "dysplasia", "patella"];

function isJointRelatedCondition(condition: string): boolean {
  const c = condition.toLowerCase();
  return JOINT_KEYWORDS.some((k) => c.includes(k));
}

export async function runHealthAlertEngineForPet(petId: string): Promise<{ created: number }> {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: { user: { select: { id: true } } },
  });
  if (!pet) return { created: 0 };

  const now = new Date();
  const fourteenAgo = subDays(now, 14);
  const logs = await prisma.healthLog.findMany({
    where: { petId, date: { gte: fourteenAgo } },
    orderBy: { date: "asc" },
  });

  if (logs.length < 5) return { created: 0 };

  const recentStart = startOfDayUtc(subDays(now, 7));
  const prevStart = startOfDayUtc(subDays(now, 14));
  const prevEnd = recentStart;

  const recentLogs = logs.filter((l) => l.date >= recentStart);
  const prevLogs = logs.filter((l) => l.date >= prevStart && l.date < prevEnd);

  let created = 0;
  const dupSince = subDays(now, 7);

  const metrics: TrendMetric[] = ["mobility", "appetite", "energy"];
  const declines: Partial<Record<TrendMetric, { prev: number; curr: number; drop: number }>> = {};

  for (const metric of metrics) {
    const prevAvg = avgMetric(prevLogs, metric);
    const currAvg = avgMetric(recentLogs, metric);
    if (prevAvg == null || currAvg == null) continue;
    if (prevLogs.filter((l) => getMetricValue(l, metric) != null).length < 5) continue;
    if (recentLogs.filter((l) => getMetricValue(l, metric) != null).length < 5) continue;

    const drop = pctDrop(prevAvg, currAvg);
    if (drop <= 0) continue;
    declines[metric] = { prev: prevAvg, curr: currAvg, drop };
  }

  const mob = declines.mobility;
  const app = declines.appetite;
  let skipMobApp = false;

  // Urgent combined trend when both mobility and appetite decline meaningfully
  if (mob && app && mob.drop >= 15 && app.drop >= 15) {
    const exists = await prisma.healthAlert.findFirst({
      where: {
        petId,
        alertType: TREND_ALERT,
        metric: null,
        title: { contains: "mobility and appetite" },
        createdAt: { gte: dupSince },
      },
    });
    if (!exists) {
      await prisma.healthAlert.create({
        data: {
          petId,
          userId: pet.userId,
          alertType: TREND_ALERT,
          severity: "urgent",
          title: `${pet.name}: mobility and appetite are both declining`,
          message: `Mobility dropped ${Math.round(mob.drop)}% and appetite ${Math.round(app.drop)}% week over week. Combined declines can signal pain, nausea, or systemic illness.`,
          recommendation: `Contact your veterinarian soon — same-day if ${pet.name} is not eating, vomiting, or very lethargic.`,
          metric: null,
          trendData: {
            mobility: mob,
            appetite: app,
          } as unknown as Prisma.InputJsonValue,
        },
      });
      created++;
      skipMobApp = true;
    }
  }

  for (const metric of metrics) {
    if (skipMobApp && (metric === "mobility" || metric === "appetite")) continue;

    const d = declines[metric];
    if (!d) continue;

    const { prev: prevAvg, curr: currAvg, drop } = d;

    let shouldAlert = false;
    let severity: "warning" | "urgent" = "warning";
    if (metric === "mobility") {
      if (drop >= 25) {
        severity = "urgent";
        shouldAlert = true;
      } else if (drop >= 15) { shouldAlert = true; }
    } else {
      // appetite or energy: 20% warning, 30% urgent
      if (drop >= 30) {
        severity = "urgent";
        shouldAlert = true;
      } else if (drop >= 20) { shouldAlert = true; }
    }

    if (!shouldAlert) continue;
    if (await hasRecentTrendDup(petId, metric, dupSince)) continue;

    const trendData = {
      current7day: Math.round(currAvg * 10) / 10,
      previous7day: Math.round(prevAvg * 10) / 10,
      change: Math.round(-drop * 10) / 10,
    };

    const title = `${pet.name}'s ${metric} has declined ${Math.round(drop)}% this week`;
    const message = `Based on daily logs, ${pet.name}'s average ${metric} score dropped from ${trendData.previous7day} to ${trendData.current7day} over the last 7 days compared to the prior week (${Math.round(drop)}% decline).`;
    const recommendation = `Track daily and discuss this trend with your veterinarian at your next visit — especially if ${pet.name} seems uncomfortable or less active.`;

    await prisma.healthAlert.create({
      data: {
        petId,
        userId: pet.userId,
        alertType: TREND_ALERT,
        severity,
        title,
        message,
        recommendation,
        metric,
        trendData: trendData as unknown as Prisma.InputJsonValue,
      },
    });
    created++;
  }

  // Energy consistently low: avg < 6/10 for recent week with 7+ points (no duplicate if % trend already fired)
  const energyAvg = avgMetric(recentLogs, "energy");
  if (
    energyAvg != null &&
    energyAvg < 6 &&
    recentLogs.filter((l) => getMetricValue(l, "energy") != null).length >= 7
  ) {
    const dup = await prisma.healthAlert.findFirst({
      where: {
        petId,
        alertType: TREND_ALERT,
        metric: "energy",
        createdAt: { gte: dupSince },
      },
    });
    if (!dup) {
      await prisma.healthAlert.create({
        data: {
          petId,
          userId: pet.userId,
          alertType: TREND_ALERT,
          severity: "warning",
          title: `${pet.name}'s energy has been low this week`,
          message: `Average energy over the last 7 days is ${energyAvg.toFixed(1)}/10 — lower than typical for active tracking.`,
          recommendation: `Note any pain, appetite change, or medication changes, and mention this pattern to your vet.`,
          metric: "energy",
          trendData: { avg7: energyAvg } as unknown as Prisma.InputJsonValue,
        },
      });
      created++;
    }
  }

  // Symptom pattern: same symptom text 3+ times in 14 days
  const symptomCounts = new Map<string, number>();
  for (const log of logs) {
    for (const s of parseSymptoms(log.symptoms)) {
      symptomCounts.set(s, (symptomCounts.get(s) ?? 0) + 1);
    }
  }
  for (const [sym, count] of Array.from(symptomCounts.entries())) {
    if (count < 3) continue;
    const dup = await prisma.healthAlert.findFirst({
      where: {
        petId,
        alertType: SYMPTOM_PATTERN_ALERT,
        message: { contains: sym },
        createdAt: { gte: subDays(now, 14) },
      },
    });
    if (dup) continue;
    await prisma.healthAlert.create({
      data: {
        petId,
        userId: pet.userId,
        alertType: SYMPTOM_PATTERN_ALERT,
        severity: "warning",
        title: `Repeated symptom logged: “${sym}”`,
        message: `You’ve logged “${sym}” ${count} times in the last 14 days.`,
        recommendation: `Patterns matter — bring this log to your veterinarian and ask whether workup is recommended.`,
      },
    });
    created++;
  }

  // Breed risk (one-time per BreedHealthRisk row)
  const risks = await resolveBreedRisks(pet.breed);
  const mobilityDeclining = (declines.mobility?.drop ?? 0) >= 15;

  for (const risk of risks) {
    if (pet.age < risk.ageOnset) continue;

    const existing = await prisma.healthAlert.findFirst({
      where: { petId, breedRiskId: risk.id },
    });
    if (existing) continue;

    let severity: "info" | "warning" = "info";
    if (mobilityDeclining && isJointRelatedCondition(risk.condition)) severity = "warning";

    const title = `Breed note: ${risk.condition} (${risk.riskLevel} risk)`;
    const message = `${pet.name} is a ${pet.breed} — ${risk.description}`;
    const recommendation = risk.recommendation;

    await prisma.healthAlert.create({
      data: {
        petId,
        userId: pet.userId,
        alertType: BREED_RISK_ALERT,
        severity,
        title,
        message,
        recommendation,
        breedRiskId: risk.id,
      },
    });
    created++;
  }

  return { created };
}

export async function runHealthAlertEngineForAllEligiblePets(): Promise<{
  petsProcessed: number;
  alertsCreated: number;
}> {
  const fourteenAgo = subDays(new Date(), 14);
  const pets = await prisma.pet.findMany({
    where: {
      isActive: true,
      healthLogs: { some: { date: { gte: fourteenAgo } } },
    },
    select: { id: true },
  });

  const counts = await Promise.all(
    pets.map(async (p) => {
      const n = await prisma.healthLog.count({
        where: { petId: p.id, date: { gte: fourteenAgo } },
      });
      return n >= 5 ? p.id : null;
    })
  );

  const eligible = counts.filter((id): id is string => id != null);
  let alertsCreated = 0;
  for (const petId of eligible) {
    const { created } = await runHealthAlertEngineForPet(petId);
    alertsCreated += created;
  }

  return { petsProcessed: eligible.length, alertsCreated };
}
