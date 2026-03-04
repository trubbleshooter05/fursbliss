import type { HealthLogEntry } from "./health-score";

export type WeekComparison = {
  metric: string;
  status: "improved" | "same" | "declined";
  currentValue: string;
  previousValue: string;
  message: string;
  icon: string;
};

export type WeekOverWeekInsights = {
  comparisons: WeekComparison[];
  nextVetCheck: {
    date: Date;
    weeksUntil: number;
    overdue: boolean;
  } | null;
  overallTrend: "improving" | "stable" | "declining";
};

/**
 * Compare this week's manual check-in + daily logs to last week
 */
export function generateWeekOverWeekInsights(
  currentWeekLogs: HealthLogEntry[],
  previousWeekLogs: HealthLogEntry[],
  currentCheckIn?: {
    energyLevel: string; // "better" | "same" | "worse"
    appetite: string;
    newSymptoms: boolean;
    vetVisit: boolean;
  },
  petAge?: number
): WeekOverWeekInsights {
  const comparisons: WeekComparison[] = [];

  // 1. Symptom frequency comparison
  const currentSymptoms = extractAllSymptoms(currentWeekLogs);
  const previousSymptoms = extractAllSymptoms(previousWeekLogs);
  
  // Find symptoms that changed frequency
  const allSymptomKeys = Array.from(new Set([
    ...Object.keys(currentSymptoms),
    ...Object.keys(previousSymptoms),
  ]));

  for (const symptom of allSymptomKeys) {
    const currentCount = currentSymptoms[symptom] || 0;
    const previousCount = previousSymptoms[symptom] || 0;

    if (currentCount === 0 && previousCount > 0) {
      // Symptom resolved!
      comparisons.push({
        metric: symptom.charAt(0).toUpperCase() + symptom.slice(1),
        status: "improved",
        currentValue: "0 episodes",
        previousValue: `${previousCount} episode${previousCount > 1 ? "s" : ""}`,
        message: `${symptom.charAt(0).toUpperCase() + symptom.slice(1)}: Resolved (was ${previousCount}x last week)`,
        icon: "✅",
      });
    } else if (currentCount > 0 && currentCount < previousCount) {
      // Symptom improving
      comparisons.push({
        metric: symptom.charAt(0).toUpperCase() + symptom.slice(1),
        status: "improved",
        currentValue: `${currentCount} episode${currentCount > 1 ? "s" : ""}`,
        previousValue: `${previousCount} episode${previousCount > 1 ? "s" : ""}`,
        message: `${symptom.charAt(0).toUpperCase() + symptom.slice(1)}: Improved (${currentCount} → down from ${previousCount})`,
        icon: "✅",
      });
    } else if (currentCount > previousCount) {
      // Symptom worsening
      comparisons.push({
        metric: symptom.charAt(0).toUpperCase() + symptom.slice(1),
        status: "declined",
        currentValue: `${currentCount} episode${currentCount > 1 ? "s" : ""}`,
        previousValue: `${previousCount} episode${previousCount > 1 ? "s" : ""}`,
        message: `${symptom.charAt(0).toUpperCase() + symptom.slice(1)}: Increased (${currentCount} → up from ${previousCount})`,
        icon: "⚠️",
      });
    }
  }

  // 2. Energy level comparison
  if (currentCheckIn?.energyLevel) {
    if (currentCheckIn.energyLevel === "better") {
      comparisons.push({
        metric: "Energy",
        status: "improved",
        currentValue: "Better",
        previousValue: "Baseline",
        message: "Energy: Improving compared to last week",
        icon: "✅",
      });
    } else if (currentCheckIn.energyLevel === "worse") {
      const lowEnergyCount = currentWeekLogs.filter((e) => e.energyLevel < 5).length;
      comparisons.push({
        metric: "Energy",
        status: "declined",
        currentValue: "Worse",
        previousValue: "Baseline",
        message: `Energy: Declined (logged as 'low' ${lowEnergyCount}x this week)`,
        icon: "⚠️",
      });
    } else {
      // Same
      comparisons.push({
        metric: "Energy",
        status: "same",
        currentValue: "Stable",
        previousValue: "Baseline",
        message: "Energy: Stable compared to last week",
        icon: "➡️",
      });
    }
  } else {
    // Calculate from logs
    const avgCurrentEnergy =
      currentWeekLogs.length > 0
        ? currentWeekLogs.reduce((sum, e) => sum + e.energyLevel, 0) / currentWeekLogs.length
        : 0;
    const avgPreviousEnergy =
      previousWeekLogs.length > 0
        ? previousWeekLogs.reduce((sum, e) => sum + e.energyLevel, 0) / previousWeekLogs.length
        : 0;

    const diff = avgCurrentEnergy - avgPreviousEnergy;
    if (diff > 0.5) {
      comparisons.push({
        metric: "Energy",
        status: "improved",
        currentValue: avgCurrentEnergy.toFixed(1),
        previousValue: avgPreviousEnergy.toFixed(1),
        message: `Energy: Improving (avg ${avgCurrentEnergy.toFixed(1)} vs ${avgPreviousEnergy.toFixed(1)})`,
        icon: "✅",
      });
    } else if (diff < -0.5) {
      comparisons.push({
        metric: "Energy",
        status: "declined",
        currentValue: avgCurrentEnergy.toFixed(1),
        previousValue: avgPreviousEnergy.toFixed(1),
        message: `Energy: Declining (avg ${avgCurrentEnergy.toFixed(1)} vs ${avgPreviousEnergy.toFixed(1)})`,
        icon: "⚠️",
      });
    } else {
      comparisons.push({
        metric: "Energy",
        status: "same",
        currentValue: avgCurrentEnergy.toFixed(1),
        previousValue: avgPreviousEnergy.toFixed(1),
        message: "Energy: Stable week-over-week",
        icon: "➡️",
      });
    }
  }

  // 3. Appetite comparison
  if (currentCheckIn?.appetite) {
    if (currentCheckIn.appetite === "better") {
      comparisons.push({
        metric: "Appetite",
        status: "improved",
        currentValue: "Better",
        previousValue: "Baseline",
        message: "Appetite: Improved compared to last week",
        icon: "✅",
      });
    } else if (currentCheckIn.appetite === "worse") {
      comparisons.push({
        metric: "Appetite",
        status: "declined",
        currentValue: "Worse",
        previousValue: "Baseline",
        message: "Appetite: Declined compared to last week",
        icon: "⚠️",
      });
    } else {
      comparisons.push({
        metric: "Appetite",
        status: "same",
        currentValue: "Stable",
        previousValue: "Baseline",
        message: "Appetite: Stable compared to last week",
        icon: "➡️",
      });
    }
  }

  // 4. Weight comparison (if available)
  const currentWeights = currentWeekLogs.filter((e) => e.weight != null);
  const previousWeights = previousWeekLogs.filter((e) => e.weight != null);
  
  if (currentWeights.length > 0 && previousWeights.length > 0) {
    const avgCurrentWeight =
      currentWeights.reduce((sum, e) => sum + e.weight!, 0) / currentWeights.length;
    const avgPreviousWeight =
      previousWeights.reduce((sum, e) => sum + e.weight!, 0) / previousWeights.length;
    
    const diff = avgCurrentWeight - avgPreviousWeight;
    const percentChange = (Math.abs(diff) / avgPreviousWeight) * 100;

    if (percentChange > 2) {
      comparisons.push({
        metric: "Weight",
        status: diff > 0 ? "declined" : "improved",
        currentValue: `${avgCurrentWeight.toFixed(1)} lbs`,
        previousValue: `${avgPreviousWeight.toFixed(1)} lbs`,
        message: `Weight: ${diff > 0 ? "Gained" : "Lost"} ${Math.abs(diff).toFixed(1)} lbs (${percentChange.toFixed(1)}%)`,
        icon: diff > 0 ? "⚠️" : "✅",
      });
    } else {
      comparisons.push({
        metric: "Weight",
        status: "same",
        currentValue: `${avgCurrentWeight.toFixed(1)} lbs`,
        previousValue: `${avgPreviousWeight.toFixed(1)} lbs`,
        message: "Weight: Stable week-over-week",
        icon: "➡️",
      });
    }
  }

  // Calculate overall trend
  const improved = comparisons.filter((c) => c.status === "improved").length;
  const declined = comparisons.filter((c) => c.status === "declined").length;
  
  let overallTrend: "improving" | "stable" | "declining" = "stable";
  if (improved > declined) overallTrend = "improving";
  if (declined > improved) overallTrend = "declining";

  // Calculate next vet check
  let nextVetCheck = null;
  if (petAge) {
    let intervalWeeks = 52; // Default: 1 year
    if (petAge >= 10) intervalWeeks = 16; // Every 4 months for 10+
    else if (petAge >= 7) intervalWeeks = 26; // Every 6 months for 7-9

    const nextCheckDate = new Date();
    nextCheckDate.setDate(nextCheckDate.getDate() + (intervalWeeks * 7));

    nextVetCheck = {
      date: nextCheckDate,
      weeksUntil: intervalWeeks,
      overdue: false,
    };
  }

  // Sort comparisons: declined first, then improved, then stable
  comparisons.sort((a, b) => {
    const order = { declined: 0, improved: 1, same: 2 };
    return order[a.status] - order[b.status];
  });

  return {
    comparisons,
    nextVetCheck,
    overallTrend,
  };
}

function extractAllSymptoms(logs: HealthLogEntry[]): Record<string, number> {
  const symptomCounts: Record<string, number> = {};

  for (const log of logs) {
    if (!log.symptoms) continue;

    let symptoms: string[] = [];
    try {
      symptoms = JSON.parse(log.symptoms);
    } catch {
      symptoms = log.symptoms.split(",").map((s) => s.trim().toLowerCase());
    }

    for (const symptom of symptoms) {
      if (symptom) {
        const normalized = symptom.toLowerCase().trim();
        symptomCounts[normalized] = (symptomCounts[normalized] || 0) + 1;
      }
    }
  }

  return symptomCounts;
}
