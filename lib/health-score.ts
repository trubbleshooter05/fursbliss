import type { Pet } from "@prisma/client";

export type HealthLogEntry = {
  id: string;
  date: Date;
  energyLevel: number;
  appetite?: string | null;
  appetiteLevel?: number | null;
  mobilityLevel?: number | null;
  weight?: number | null;
  symptoms?: string | null;
  notes?: string | null;
};

export type HealthFlag = {
  type: "red" | "yellow" | "green";
  title: string;
  description: string;
  triageLink?: string;
};

export type HealthScore = {
  score: number;
  trend: "improving" | "stable" | "declining";
  label: string;
  color: string;
};

export type VetCheckStatus = {
  nextCheckDate: Date;
  overdue: boolean;
  weeksUntil: number;
  recommendedInterval: string;
};

/**
 * Calculate overall health score from 0-100 based on recent tracking entries
 */
export function calculateHealthScore(entries: HealthLogEntry[]): HealthScore | null {
  // Need at least 3 entries to calculate a meaningful score
  if (entries.length < 3) {
    return null;
  }

  // Get last 14 days of data
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 14);
  const recentEntries = entries.filter((e) => e.date >= cutoffDate);

  if (recentEntries.length === 0) {
    return null;
  }

  // Calculate component scores (0-100 each)
  const energyScore = calculateEnergyScore(recentEntries);
  const appetiteScore = calculateAppetiteScore(recentEntries);
  const mobilityScore = calculateMobilityScore(recentEntries);
  const weightScore = calculateWeightScore(recentEntries);

  // Weighted average: appetite 30%, energy 25%, mobility 25%, weight 20%
  const weightedScore =
    appetiteScore * 0.3 + energyScore * 0.25 + mobilityScore * 0.25 + weightScore * 0.2;

  // Calculate trend (compare last 7 days to previous 7 days)
  const trend = calculateTrend(entries);

  // Determine label and color based on score
  let label = "Looking Good";
  let color = "green";

  if (weightedScore < 40) {
    label = "Talk to Your Vet";
    color = "red";
  } else if (weightedScore < 60) {
    label = "Attention Needed";
    color = "orange";
  } else if (weightedScore < 80) {
    label = "Worth Watching";
    color = "yellow";
  }

  return {
    score: Math.round(weightedScore),
    trend,
    label,
    color,
  };
}

function calculateEnergyScore(entries: HealthLogEntry[]): number {
  const energyLevels = entries.map((e) => e.energyLevel).filter((e) => e != null);
  if (energyLevels.length === 0) return 70; // neutral default

  const avgEnergy = energyLevels.reduce((sum, e) => sum + e, 0) / energyLevels.length;
  // Scale 1-10 to 0-100
  return (avgEnergy / 10) * 100;
}

function calculateAppetiteScore(entries: HealthLogEntry[]): number {
  const appetiteLevels = entries
    .map((e) => e.appetiteLevel)
    .filter((a): a is number => a != null);

  if (appetiteLevels.length === 0) return 70; // neutral default

  const avgAppetite = appetiteLevels.reduce((sum, a) => sum + a, 0) / appetiteLevels.length;
  // Scale 1-10 to 0-100
  return (avgAppetite / 10) * 100;
}

function calculateMobilityScore(entries: HealthLogEntry[]): number {
  const mobilityLevels = entries
    .map((e) => e.mobilityLevel)
    .filter((m): m is number => m != null);

  if (mobilityLevels.length === 0) return 70; // neutral default

  const avgMobility = mobilityLevels.reduce((sum, m) => sum + m, 0) / mobilityLevels.length;
  // Scale 1-10 to 0-100
  return (avgMobility / 10) * 100;
}

function calculateWeightScore(entries: HealthLogEntry[]): number {
  const weights = entries.map((e) => e.weight).filter((w): w is number => w != null);

  if (weights.length < 2) return 100; // not enough data, assume stable

  // Check for rapid weight change (>5% in 7 days is concerning)
  const sortedByDate = [...entries]
    .filter((e) => e.weight != null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (sortedByDate.length < 2) return 100;

  const recentWeight = sortedByDate[0].weight!;
  const olderWeight = sortedByDate[sortedByDate.length - 1].weight!;
  const percentChange = Math.abs((recentWeight - olderWeight) / olderWeight) * 100;

  if (percentChange > 5) return 40; // Rapid change = red flag
  if (percentChange > 3) return 70; // Moderate change = yellow flag
  return 100; // Stable
}

function calculateTrend(entries: HealthLogEntry[]): "improving" | "stable" | "declining" {
  if (entries.length < 14) return "stable";

  const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Compare last 7 days avg to previous 7 days avg
  const last7Days = sortedEntries.slice(-7);
  const previous7Days = sortedEntries.slice(-14, -7);

  if (previous7Days.length === 0) return "stable";

  const last7Avg =
    last7Days.reduce((sum, e) => sum + e.energyLevel, 0) / last7Days.length;
  const prev7Avg =
    previous7Days.reduce((sum, e) => sum + e.energyLevel, 0) / previous7Days.length;

  const diff = last7Avg - prev7Avg;

  if (diff > 0.5) return "improving";
  if (diff < -0.5) return "declining";
  return "stable";
}

/**
 * Analyze patterns and generate health flags
 */
export function getHealthFlags(entries: HealthLogEntry[], pet: Pet): HealthFlag[] {
  const flags: HealthFlag[] = [];

  if (entries.length < 3) {
    return flags;
  }

  // Sort by date descending (most recent first)
  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentEntries = sortedEntries.slice(0, 7); // Last 7 days

  // RED FLAG: Appetite declined 3+ days in a row
  const appetiteDecline = checkConsecutiveAppetiteDecline(recentEntries);
  if (appetiteDecline.flag) {
    flags.push({
      type: "red",
      title: "Appetite has declined 3+ days in a row",
      description:
        "Prolonged loss of appetite can indicate illness. Monitor closely and consider using the triage tool if other symptoms appear.",
      triageLink: "/triage?symptom=won't+eat",
    });
  }

  // RED FLAG: Sudden weight change
  const weightChange = checkWeightChange(entries);
  if (weightChange.isRed) {
    flags.push({
      type: "red",
      title: "Sudden weight change detected",
      description: `${pet.name}'s weight changed ${weightChange.percentChange}% in the last week. Rapid weight changes warrant a vet visit.`,
      triageLink: "/triage?symptom=weight+loss",
    });
  }

  // YELLOW FLAG: Energy levels trending down
  const lowEnergyCount = recentEntries.filter((e) => e.energyLevel < 5).length;
  if (lowEnergyCount >= 3) {
    flags.push({
      type: "yellow",
      title: "Energy levels trending down",
      description:
        "Lower energy has been logged 3+ times recently. This could be normal aging or a sign to watch for other changes.",
      triageLink: "/triage?symptom=tired",
    });
  }

  // YELLOW FLAG: Mobility changes
  const lowMobilityCount = recentEntries.filter(
    (e) => e.mobilityLevel != null && e.mobilityLevel < 5
  ).length;
  if (lowMobilityCount >= 3) {
    flags.push({
      type: "yellow",
      title: "Mobility changes noticed",
      description:
        "Reduced mobility logged multiple times. Consider joint supplements or a vet check if it worsens.",
      triageLink: "/triage?symptom=limping",
    });
  }

  // GREEN FLAG: Consistent good appetite
  const goodAppetiteCount = recentEntries.filter(
    (e) => e.appetiteLevel != null && e.appetiteLevel >= 7
  ).length;
  if (goodAppetiteCount >= 5 && flags.length === 0) {
    flags.push({
      type: "green",
      title: "Consistent appetite — keep it up!",
      description: `${pet.name} has been eating well consistently. Great sign of overall health.`,
    });
  }

  // GREEN FLAG: Activity levels stable
  const goodEnergyCount = recentEntries.filter((e) => e.energyLevel >= 7).length;
  if (goodEnergyCount >= 5 && flags.length === 0) {
    flags.push({
      type: "green",
      title: "Activity levels stable",
      description: `${pet.name} has maintained good energy levels. Keep up the routine!`,
    });
  }

  // Sort: red > yellow > green, return max 3
  return flags.sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 };
    return order[a.type] - order[b.type];
  }).slice(0, 3);
}

function checkConsecutiveAppetiteDecline(entries: HealthLogEntry[]): { flag: boolean } {
  if (entries.length < 3) return { flag: false };

  const recentThree = entries.slice(0, 3);
  const allLow = recentThree.every(
    (e) => e.appetiteLevel != null && e.appetiteLevel < 5
  );

  return { flag: allLow };
}

function checkWeightChange(entries: HealthLogEntry[]): {
  isRed: boolean;
  percentChange: number;
} {
  const weightsWithDates = entries
    .filter((e) => e.weight != null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (weightsWithDates.length < 2) return { isRed: false, percentChange: 0 };

  const mostRecent = weightsWithDates[0].weight!;
  const weekAgo = weightsWithDates.find((e) => {
    const daysDiff = (weightsWithDates[0].date.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 7;
  });

  if (!weekAgo?.weight) return { isRed: false, percentChange: 0 };

  const percentChange = Math.abs((mostRecent - weekAgo.weight) / weekAgo.weight) * 100;

  return {
    isRed: percentChange > 5,
    percentChange: Math.round(percentChange * 10) / 10,
  };
}

/**
 * Calculate next recommended vet check based on pet age
 */
export function getNextVetCheck(pet: Pet, lastVetVisit?: Date): VetCheckStatus {
  // Determine interval based on age
  let intervalMonths = 12;
  let recommendedInterval = "every 12 months";

  if (pet.age >= 10) {
    intervalMonths = 4;
    recommendedInterval = "every 4 months";
  } else if (pet.age >= 7) {
    intervalMonths = 6;
    recommendedInterval = "every 6 months";
  }

  // Calculate from last vet visit or registration
  const baseDate = lastVetVisit || pet.createdAt;
  const nextCheckDate = new Date(baseDate);
  nextCheckDate.setMonth(nextCheckDate.getMonth() + intervalMonths);

  const now = new Date();
  const msUntilCheck = nextCheckDate.getTime() - now.getTime();
  const weeksUntil = Math.round(msUntilCheck / (1000 * 60 * 60 * 24 * 7));

  return {
    nextCheckDate,
    overdue: weeksUntil < 0,
    weeksUntil: Math.abs(weeksUntil),
    recommendedInterval,
  };
}
