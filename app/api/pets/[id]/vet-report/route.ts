import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";
import { generateVetReportPDF } from "@/lib/generate-vet-report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface VetReadyReport {
  generatedAt: string;
  pet: {
    name: string;
    breed: string;
    age: string;
    weight: { current: number; thirtyDaysAgo: number | null; trend: "gaining" | "losing" | "stable" };
  };
  period: { start: string; end: string; totalDaysLogged: number; logCompletionRate: number };
  trends: {
    energy: MetricTrend;
    appetite: MetricTrend;
    mobility: MetricTrend;
    mood: MetricTrend;
    stool: { normalDays: number; abnormalDays: number; abnormalDetails: string[] };
  };
  concerns: Concern[];
  discussionTopics: string[];
  weeklyCheckIns: {
    completed: number;
    totalPossible: number;
    newSymptomsReported: boolean;
    symptomDetails: string[];
    vetVisitsReported: number;
  };
  supplements: Array<{ name: string; dosage: string; startDate: string }>;
  alerts: Array<{ date: string; level: "red" | "yellow" | "green"; reason: string }>;
}

interface MetricTrend {
  average: number;
  trend: "improving" | "declining" | "stable";
  weekOverWeek: number[]; // [W1, W2, W3, W4] oldest → newest
}

interface Concern {
  severity: "high" | "medium" | "low";
  category: string;
  description: string;
  dataPoints: number;
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function avg(values: number[]): number {
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function weekBounds(weekNum: 1 | 2 | 3 | 4, refDate: Date): { start: Date; end: Date } {
  // Week 4 = last 7 days (newest), Week 1 = days 22-30 (oldest)
  const end = new Date(refDate);
  end.setDate(end.getDate() - (4 - weekNum) * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return { start, end };
}

function calcTrend(weeklyAvgs: number[]): "improving" | "declining" | "stable" {
  const validWeeks = weeklyAvgs.filter((v) => v > 0);
  if (validWeeks.length < 2) return "stable";
  const first = validWeeks[0];
  const last = validWeeks[validWeeks.length - 1];
  const pct = first > 0 ? (last - first) / first : 0;
  if (pct > 0.05) return "improving";
  if (pct < -0.05) return "declining";
  return "stable";
}

function petAge(pet: { age: number; dateOfBirth: Date | null }): string {
  if (pet.dateOfBirth) {
    const now = new Date();
    const years = now.getFullYear() - pet.dateOfBirth.getFullYear();
    const months = now.getMonth() - pet.dateOfBirth.getMonth();
    const totalMonths = years * 12 + months;
    const y = Math.floor(totalMonths / 12);
    const m = Math.abs(totalMonths % 12);
    return `${y} year${y !== 1 ? "s" : ""}${m > 0 ? `, ${m} month${m !== 1 ? "s" : ""}` : ""}`;
  }
  return `${pet.age} year${pet.age !== 1 ? "s" : ""}`;
}

function weightTrend(current: number, thirtyDaysAgo: number | null): "gaining" | "losing" | "stable" {
  if (!thirtyDaysAgo) return "stable";
  const pct = (current - thirtyDaysAgo) / thirtyDaysAgo;
  if (pct > 0.01) return "gaining";
  if (pct < -0.01) return "losing";
  return "stable";
}

// ── CONCERN GENERATION ───────────────────────────────────────────────────────

function buildConcerns(
  trends: VetReadyReport["trends"],
  healthLogs: Array<{ date: Date; energyLevel: number; mobilityLevel: number | null; appetiteLevel: number | null; moodLevel: number | null; weight: number | null }>,
  weeklyCheckIns: Array<{ energyLevel: string; appetite: string; newSymptoms: boolean; symptomDetails: string | null }>,
  pet: { weight: number; breed: string; age: number },
  weeksData: { energy: number[]; appetite: number[]; mobility: number[]; mood: number[] }
): Concern[] {
  const concerns: Concern[] = [];

  // ── Metric week-over-week consecutive decline >15% ──────────────────────
  const metrics = [
    { name: "Energy", key: "energy" as const },
    { name: "Appetite", key: "appetite" as const },
    { name: "Mobility", key: "mobility" as const },
    { name: "Mood", key: "mood" as const },
  ];

  for (const { name, key } of metrics) {
    const w = weeksData[key];
    const validW = w.map((v, i) => ({ v, i })).filter(({ v }) => v > 0);
    if (validW.length < 3) continue;

    // Check 2+ consecutive week declines >15%
    let consecutiveDeclines = 0;
    for (let i = 1; i < validW.length; i++) {
      const prev = validW[i - 1].v;
      const curr = validW[i].v;
      if (prev > 0 && (prev - curr) / prev > 0.15) {
        consecutiveDeclines++;
      } else {
        consecutiveDeclines = 0;
      }
    }
    if (consecutiveDeclines >= 2) {
      const from = validW[0].v;
      const to = validW[validW.length - 1].v;
      const pct = Math.round(((from - to) / from) * 100);
      concerns.push({
        severity: "high",
        category: `${name} Decline`,
        description: `${name} scores declined ${pct}% over the past 30 days (${from.toFixed(1)} → ${to.toFixed(1)} avg on 10-pt scale) across 2+ consecutive weeks.`,
        dataPoints: healthLogs.length,
      });
      continue;
    }

    // Check >10% decline over full 30-day period
    const first = w.find((v) => v > 0) ?? 0;
    const last = [...w].reverse().find((v) => v > 0) ?? 0;
    if (first > 0 && (first - last) / first > 0.1) {
      const pct = Math.round(((first - last) / first) * 100);
      concerns.push({
        severity: "medium",
        category: `${name} Change`,
        description: `${name} declined ${pct}% over the 30-day period (avg ${first.toFixed(1)} → ${last.toFixed(1)}).`,
        dataPoints: healthLogs.length,
      });
    }
  }

  // ── Weight change >5% in 30 days ─────────────────────────────────────────
  const currentWeight = pet.weight;
  const firstLogWithWeight = healthLogs.find((l) => l.weight != null);
  const oldWeight = firstLogWithWeight?.weight ?? null;
  if (oldWeight && Math.abs((currentWeight - oldWeight) / oldWeight) > 0.05) {
    const pct = Math.round(Math.abs(((currentWeight - oldWeight) / oldWeight) * 100));
    const direction = currentWeight < oldWeight ? "loss" : "gain";
    concerns.push({
      severity: "high",
      category: `Significant Weight ${direction === "loss" ? "Loss" : "Gain"}`,
      description: `Body weight changed ${pct}% over 30 days (${oldWeight.toFixed(1)} lbs → ${currentWeight.toFixed(1)} lbs). Rapid ${direction} may indicate underlying illness.`,
      dataPoints: healthLogs.filter((l) => l.weight != null).length,
    });
  }

  // ── Stool abnormal >5 days ───────────────────────────────────────────────
  if (trends.stool.abnormalDays > 5) {
    concerns.push({
      severity: "medium",
      category: "Digestive Irregularity",
      description: `Abnormal stool recorded on ${trends.stool.abnormalDays} of the past 30 days. Details: ${trends.stool.abnormalDetails.slice(0, 3).join("; ") || "see logs"}.`,
      dataPoints: trends.stool.normalDays + trends.stool.abnormalDays,
    });
  }

  // ── Weekly check-in signals ──────────────────────────────────────────────
  const latestCheckIn = weeklyCheckIns[0];
  if (latestCheckIn) {
    if (latestCheckIn.energyLevel === "much_worse" || latestCheckIn.appetite === "much_worse") {
      concerns.push({
        severity: "high",
        category: "Owner-Reported Rapid Decline",
        description: `Most recent weekly check-in reports${latestCheckIn.energyLevel === "much_worse" ? " significantly worse energy" : ""}${latestCheckIn.appetite === "much_worse" ? " significantly worse appetite" : ""}.`,
        dataPoints: weeklyCheckIns.length,
      });
    } else if (latestCheckIn.newSymptoms && latestCheckIn.symptomDetails) {
      concerns.push({
        severity: "medium",
        category: "New Symptoms Reported",
        description: `Owner reported new symptoms in weekly check-in: "${latestCheckIn.symptomDetails.slice(0, 120)}".`,
        dataPoints: 1,
      });
    }
  }

  // ── Logging gap ──────────────────────────────────────────────────────────
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLogs = healthLogs.filter((l) => l.date >= sevenDaysAgo);
  if (recentLogs.length === 0) {
    concerns.push({
      severity: "low",
      category: "Incomplete Data",
      description: "No health logs recorded in the past 7 days. Trend analysis may be less accurate.",
      dataPoints: 0,
    });
  }

  // Sort: high → medium → low, cap at 6
  return concerns
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    })
    .slice(0, 6);
}

// ── DISCUSSION TOPICS ────────────────────────────────────────────────────────

const BREED_RISKS: Record<string, string[]> = {
  "golden retriever": ["cancer screening"],
  "labrador": ["joint disease", "obesity"],
  "labrador retriever": ["joint disease", "obesity"],
  "german shepherd": ["hip dysplasia", "degenerative myelopathy"],
  "great dane": ["cardiac evaluation", "bloat risk"],
  "bernese mountain dog": ["cancer screening", "orthopedic evaluation"],
  "boxer": ["cardiac screening", "cancer screening"],
  "cavalier king charles spaniel": ["cardiac evaluation"],
  "dachshund": ["spinal assessment"],
  "poodle": ["thyroid panel"],
};

function buildDiscussionTopics(
  concerns: Concern[],
  pet: { breed: string; age: number },
  supplementCount: number,
  weeklyCheckIns: Array<{ vetVisit: boolean }>
): string[] {
  const topics: string[] = [];
  const breedLower = pet.breed.toLowerCase();
  const breedRisks = BREED_RISKS[breedLower] ?? [];

  // Map high/medium concerns to vet discussion topics
  for (const concern of concerns.filter((c) => c.severity !== "low")) {
    let topic = "";
    if (concern.category.includes("Energy") || concern.category.includes("Mood")) {
      topic = `Systemic health workup — ${concern.category.toLowerCase()} flagged. Consider CBC and metabolic panel.`;
      if (breedRisks.includes("cancer screening")) topic += " Rule out neoplasia.";
    } else if (concern.category.includes("Appetite")) {
      topic = `GI and metabolic evaluation — appetite change detected. Consider abdominal ultrasound if bloodwork normal.`;
    } else if (concern.category.includes("Mobility")) {
      topic = `Orthopedic assessment — mobility score declined${breedRisks.length ? `. Breed (${pet.breed}) has predisposition to ${breedRisks[0]}` : ""}.`;
    } else if (concern.category.includes("Weight")) {
      topic = `Endocrine and GI workup — significant weight ${concern.category.toLowerCase().includes("loss") ? "loss" : "gain"} (see data in Section 1).`;
    } else if (concern.category.includes("Digestive")) {
      topic = `GI evaluation — abnormal stool pattern recorded on ${concern.dataPoints}+ occasions. Discuss fecal test and diet review.`;
    } else if (concern.category.includes("New Symptoms") || concern.category.includes("Owner-Reported")) {
      topic = `Review of owner-reported new symptoms — see weekly check-in summary for details.`;
    }
    if (topic && !topics.includes(topic)) topics.push(topic);
    if (topics.length >= 3) break;
  }

  // Supplement review if 2+
  if (supplementCount >= 2) {
    topics.push(`Supplement interaction review — ${supplementCount} active supplements. Verify no contraindications.`);
  }

  // Senior bloodwork if 10+ years and no bloodwork mention in check-ins
  const hasVetVisit = weeklyCheckIns.some((c) => c.vetVisit);
  if (pet.age >= 10 && !hasVetVisit) {
    topics.push(`Senior bloodwork panel — dog is ${pet.age}+ years old. No recent vet visit reported in check-in history.`);
  }

  // Breed-specific catch-all if no topics generated yet
  if (topics.length === 0 && breedRisks.length > 0) {
    topics.push(`Routine breed-specific screening — ${pet.breed} may benefit from ${breedRisks.join(", ")}.`);
  }

  return topics.slice(0, 5);
}

// ── ROUTE HANDLER ────────────────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    if (!isSubscriptionActive(user)) {
      return new Response(JSON.stringify({ message: "Vet reports are a premium feature." }), { status: 403 });
    }

    const limiter = rateLimit(request, `vet-report:${session.user.id}`, {
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (!limiter.success) {
      return new Response(JSON.stringify({ message: "Too many requests. Try again later." }), {
        status: 429,
        headers: { "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)) },
      });
    }

    const { id: petId } = await params;

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: session.user.id },
    });

    if (!pet) {
      return new Response(JSON.stringify({ message: "Pet not found" }), { status: 404 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all data in parallel
    const [healthLogs, gutLogs, weeklyCheckIns, medications, supplements, alertHistory] =
      await Promise.all([
        prisma.healthLog.findMany({
          where: { petId, date: { gte: thirtyDaysAgo } },
          orderBy: { date: "asc" },
          select: {
            id: true,
            date: true,
            energyLevel: true,
            mobilityLevel: true,
            moodLevel: true,
            appetiteLevel: true,
            appetite: true,
            mood: true,
            weight: true,
            symptoms: true,
            notes: true,
          },
        }),
        prisma.gutHealthLog.findMany({
          where: { petId, date: { gte: thirtyDaysAgo } },
          orderBy: { date: "asc" },
          select: { date: true, stoolQuality: true, stoolNotes: true },
        }),
        prisma.weeklyCheckIn.findMany({
          where: { petId, createdAt: { gte: thirtyDaysAgo } },
          orderBy: { createdAt: "desc" },
          select: { energyLevel: true, appetite: true, newSymptoms: true, symptomDetails: true, vetVisit: true, createdAt: true },
        }),
        prisma.medication.findMany({
          where: { petId, active: true },
          select: { name: true, dosage: true, startDate: true },
        }),
        prisma.petSupplement.findMany({
          where: { petId, isActive: true },
          select: { name: true, dosage: true, startDate: true },
        }),
        prisma.healthAlert.findMany({
          where: { petId, createdAt: { gte: thirtyDaysAgo } },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { createdAt: true, alertLevel: true, alertReason: true },
        }),
      ]);

    // ── Period stats ────────────────────────────────────────────────────────
    const totalDaysLogged = new Set(healthLogs.map((l) => l.date.toISOString().split("T")[0])).size;
    const logCompletionRate = Math.round((totalDaysLogged / 30) * 100);

    // ── Weight trend ────────────────────────────────────────────────────────
    const oldestLogWeight = healthLogs.find((l) => l.weight != null)?.weight ?? null;
    const currentWeight = pet.weight;

    // ── Build weekly averages for each metric ────────────────────────────────
    const weeksData = { energy: [0, 0, 0, 0], appetite: [0, 0, 0, 0], mobility: [0, 0, 0, 0], mood: [0, 0, 0, 0] };
    const weekCounts = { energy: [0, 0, 0, 0], appetite: [0, 0, 0, 0], mobility: [0, 0, 0, 0], mood: [0, 0, 0, 0] };

    for (const log of healthLogs) {
      const dayOffset = Math.floor((now.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24));
      const weekIdx = dayOffset < 7 ? 3 : dayOffset < 14 ? 2 : dayOffset < 21 ? 1 : 0;

      weeksData.energy[weekIdx] += log.energyLevel;
      weekCounts.energy[weekIdx]++;

      if (log.mobilityLevel != null) {
        weeksData.mobility[weekIdx] += log.mobilityLevel;
        weekCounts.mobility[weekIdx]++;
      }
      if (log.moodLevel != null) {
        weeksData.mood[weekIdx] += log.moodLevel;
        weekCounts.mood[weekIdx]++;
      }
      if (log.appetiteLevel != null) {
        weeksData.appetite[weekIdx] += log.appetiteLevel;
        weekCounts.appetite[weekIdx]++;
      }
    }

    const weeklyAvgs = {
      energy: weeksData.energy.map((sum, i) => (weekCounts.energy[i] ? Math.round((sum / weekCounts.energy[i]) * 10) / 10 : 0)),
      appetite: weeksData.appetite.map((sum, i) => (weekCounts.appetite[i] ? Math.round((sum / weekCounts.appetite[i]) * 10) / 10 : 0)),
      mobility: weeksData.mobility.map((sum, i) => (weekCounts.mobility[i] ? Math.round((sum / weekCounts.mobility[i]) * 10) / 10 : 0)),
      mood: weeksData.mood.map((sum, i) => (weekCounts.mood[i] ? Math.round((sum / weekCounts.mood[i]) * 10) / 10 : 0)),
    };

    const allEnergy = healthLogs.map((l) => l.energyLevel);
    const allAppetite = healthLogs.filter((l) => l.appetiteLevel != null).map((l) => l.appetiteLevel!);
    const allMobility = healthLogs.filter((l) => l.mobilityLevel != null).map((l) => l.mobilityLevel!);
    const allMood = healthLogs.filter((l) => l.moodLevel != null).map((l) => l.moodLevel!);

    // ── Stool analysis ───────────────────────────────────────────────────────
    const abnormalGutLogs = gutLogs.filter((g) => g.stoolQuality <= 2);
    const stoolTrend = {
      normalDays: gutLogs.length - abnormalGutLogs.length,
      abnormalDays: abnormalGutLogs.length,
      abnormalDetails: abnormalGutLogs
        .map((g) => g.stoolNotes)
        .filter((n): n is string => !!n)
        .slice(0, 5),
    };

    // ── Assemble trends ──────────────────────────────────────────────────────
    const trends: VetReadyReport["trends"] = {
      energy: { average: avg(allEnergy), trend: calcTrend(weeklyAvgs.energy), weekOverWeek: weeklyAvgs.energy },
      appetite: { average: avg(allAppetite), trend: calcTrend(weeklyAvgs.appetite), weekOverWeek: weeklyAvgs.appetite },
      mobility: { average: avg(allMobility), trend: calcTrend(weeklyAvgs.mobility), weekOverWeek: weeklyAvgs.mobility },
      mood: { average: avg(allMood), trend: calcTrend(weeklyAvgs.mood), weekOverWeek: weeklyAvgs.mood },
      stool: stoolTrend,
    };

    // ── Concerns ─────────────────────────────────────────────────────────────
    const concerns = buildConcerns(
      trends,
      healthLogs,
      weeklyCheckIns,
      { weight: currentWeight, breed: pet.breed, age: pet.age },
      weeklyAvgs
    );

    // ── Discussion topics ─────────────────────────────────────────────────────
    const supplementCount = medications.length + supplements.length;
    const discussionTopics = buildDiscussionTopics(concerns, pet, supplementCount, weeklyCheckIns);

    // ── Build report ──────────────────────────────────────────────────────────
    const report: VetReadyReport = {
      generatedAt: now.toISOString(),
      pet: {
        name: pet.name,
        breed: pet.breed,
        age: petAge(pet),
        weight: {
          current: currentWeight,
          thirtyDaysAgo: oldestLogWeight,
          trend: weightTrend(currentWeight, oldestLogWeight),
        },
      },
      period: {
        start: thirtyDaysAgo.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        end: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        totalDaysLogged,
        logCompletionRate,
      },
      trends,
      concerns,
      discussionTopics,
      weeklyCheckIns: {
        completed: weeklyCheckIns.length,
        totalPossible: 4,
        newSymptomsReported: weeklyCheckIns.some((c) => c.newSymptoms),
        symptomDetails: weeklyCheckIns.flatMap((c) => (c.symptomDetails ? [c.symptomDetails] : [])).slice(0, 5),
        vetVisitsReported: weeklyCheckIns.filter((c) => c.vetVisit).length,
      },
      supplements: [
        ...medications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          startDate: m.startDate ? m.startDate.toLocaleDateString("en-US") : "Unknown",
        })),
        ...supplements.map((s) => ({
          name: s.name,
          dosage: s.dosage,
          startDate: s.startDate ? s.startDate.toLocaleDateString("en-US") : "Unknown",
        })),
      ].slice(0, 8),
      alerts: alertHistory.map((a) => ({
        date: a.createdAt.toLocaleDateString("en-US"),
        level: a.alertLevel as "red" | "yellow" | "green",
        reason: a.alertReason,
      })),
    };

    // ── Return JSON or PDF based on ?format param ─────────────────────────────
    const { searchParams } = new URL(request.url);
    if (searchParams.get("format") === "json") {
      return new Response(JSON.stringify(report), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Generate PDF ──────────────────────────────────────────────────────────
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateVetReportPDF(report);
    } catch (pdfError) {
      const msg = pdfError instanceof Error ? pdfError.message : String(pdfError);
      console.error("PDF generation failed:", msg, pdfError);
      return new Response(JSON.stringify({ message: "PDF generation failed", detail: msg }), { status: 500 });
    }

    const filename = `${pet.name.replace(/[^a-zA-Z0-9]/g, "-")}-vet-report-${now.toISOString().split("T")[0]}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Vet report generation failed:", msg, error);
    return new Response(JSON.stringify({ message: "Unable to generate report. Please try again.", detail: msg }), { status: 500 });
  }
}
