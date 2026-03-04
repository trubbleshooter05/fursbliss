import type { HealthLogEntry } from "./health-score";

export type PatternAlert = {
  symptom: string;
  currentWeekCount: number;
  previousWeekCount: number;
  changePercent: number;
  severity: "red" | "yellow";
  message: string;
};

/**
 * Detect behavior pattern changes (e.g., "Limping logged 4x this week, up from 1x last week")
 */
export function detectPatternChanges(entries: HealthLogEntry[]): PatternAlert[] {
  const alerts: PatternAlert[] = [];

  if (entries.length < 7) {
    return alerts; // Need at least a week of data
  }

  // Sort by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Split into current week and previous week
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  const currentWeekEntries = sortedEntries.filter((e) => e.date >= oneWeekAgo);
  const previousWeekEntries = sortedEntries.filter(
    (e) => e.date >= twoWeeksAgo && e.date < oneWeekAgo
  );

  if (currentWeekEntries.length === 0 || previousWeekEntries.length === 0) {
    return alerts;
  }

  // Check for symptom frequency changes
  const symptomPatterns = analyzeSymptomFrequency(currentWeekEntries, previousWeekEntries);
  alerts.push(...symptomPatterns);

  // Check for low energy frequency changes
  const energyPattern = analyzeEnergyFrequency(currentWeekEntries, previousWeekEntries);
  if (energyPattern) alerts.push(energyPattern);

  // Check for appetite changes
  const appetitePattern = analyzeAppetiteFrequency(currentWeekEntries, previousWeekEntries);
  if (appetitePattern) alerts.push(appetitePattern);

  // Check for mobility changes
  const mobilityPattern = analyzeMobilityFrequency(currentWeekEntries, previousWeekEntries);
  if (mobilityPattern) alerts.push(mobilityPattern);

  // Sort by severity (red first)
  return alerts.sort((a, b) => (a.severity === "red" ? -1 : 1));
}

function analyzeSymptomFrequency(
  currentWeek: HealthLogEntry[],
  previousWeek: HealthLogEntry[]
): PatternAlert[] {
  const alerts: PatternAlert[] = [];

  // Extract all symptoms from logs
  const currentSymptoms = extractSymptoms(currentWeek);
  const previousSymptoms = extractSymptoms(previousWeek);

  // Find symptoms that increased in frequency
  const allSymptomKeys = Array.from(new Set([...Object.keys(currentSymptoms), ...Object.keys(previousSymptoms)]));

  for (const symptom of allSymptomKeys) {
    const currentCount = currentSymptoms[symptom] || 0;
    const previousCount = previousSymptoms[symptom] || 0;

    // Only alert if frequency increased by 2+ or doubled
    if (currentCount >= previousCount + 2 || (currentCount >= previousCount * 2 && previousCount > 0)) {
      const changePercent = previousCount > 0 
        ? Math.round(((currentCount - previousCount) / previousCount) * 100)
        : 100;

      alerts.push({
        symptom: symptom.charAt(0).toUpperCase() + symptom.slice(1),
        currentWeekCount: currentCount,
        previousWeekCount: previousCount,
        changePercent,
        severity: currentCount >= 4 ? "red" : "yellow",
        message: `⚠️ ${symptom.charAt(0).toUpperCase() + symptom.slice(1)} logged ${currentCount}x this week (up from ${previousCount}x last week)`,
      });
    }
  }

  return alerts;
}

function extractSymptoms(entries: HealthLogEntry[]): Record<string, number> {
  const symptomCounts: Record<string, number> = {};

  for (const entry of entries) {
    if (!entry.symptoms) continue;

    // Parse symptoms (could be comma-separated, JSON array, or single string)
    let symptoms: string[] = [];
    try {
      symptoms = JSON.parse(entry.symptoms);
    } catch {
      symptoms = entry.symptoms.split(",").map((s) => s.trim().toLowerCase());
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

function analyzeEnergyFrequency(
  currentWeek: HealthLogEntry[],
  previousWeek: HealthLogEntry[]
): PatternAlert | null {
  const currentLowEnergyCount = currentWeek.filter((e) => e.energyLevel < 4).length;
  const previousLowEnergyCount = previousWeek.filter((e) => e.energyLevel < 4).length;

  // Only alert if low energy increased significantly
  if (currentLowEnergyCount >= previousLowEnergyCount + 2 && currentLowEnergyCount >= 3) {
    const changePercent = previousLowEnergyCount > 0
      ? Math.round(((currentLowEnergyCount - previousLowEnergyCount) / previousLowEnergyCount) * 100)
      : 100;

    return {
      symptom: "Low energy",
      currentWeekCount: currentLowEnergyCount,
      previousWeekCount: previousLowEnergyCount,
      changePercent,
      severity: currentLowEnergyCount >= 4 ? "red" : "yellow",
      message: `⚠️ Low energy logged ${currentLowEnergyCount}x this week (up from ${previousLowEnergyCount}x last week)`,
    };
  }

  return null;
}

function analyzeAppetiteFrequency(
  currentWeek: HealthLogEntry[],
  previousWeek: HealthLogEntry[]
): PatternAlert | null {
  const currentLowAppetiteCount = currentWeek.filter(
    (e) => e.appetiteLevel != null && e.appetiteLevel < 4
  ).length;
  const previousLowAppetiteCount = previousWeek.filter(
    (e) => e.appetiteLevel != null && e.appetiteLevel < 4
  ).length;

  if (currentLowAppetiteCount >= previousLowAppetiteCount + 2 && currentLowAppetiteCount >= 3) {
    const changePercent = previousLowAppetiteCount > 0
      ? Math.round(((currentLowAppetiteCount - previousLowAppetiteCount) / previousLowAppetiteCount) * 100)
      : 100;

    return {
      symptom: "Poor appetite",
      currentWeekCount: currentLowAppetiteCount,
      previousWeekCount: previousLowAppetiteCount,
      changePercent,
      severity: currentLowAppetiteCount >= 4 ? "red" : "yellow",
      message: `⚠️ Poor appetite logged ${currentLowAppetiteCount}x this week (up from ${previousLowAppetiteCount}x last week)`,
    };
  }

  return null;
}

function analyzeMobilityFrequency(
  currentWeek: HealthLogEntry[],
  previousWeek: HealthLogEntry[]
): PatternAlert | null {
  const currentLowMobilityCount = currentWeek.filter(
    (e) => e.mobilityLevel != null && e.mobilityLevel < 4
  ).length;
  const previousLowMobilityCount = previousWeek.filter(
    (e) => e.mobilityLevel != null && e.mobilityLevel < 4
  ).length;

  if (currentLowMobilityCount >= previousLowMobilityCount + 2 && currentLowMobilityCount >= 3) {
    const changePercent = previousLowMobilityCount > 0
      ? Math.round(((currentLowMobilityCount - previousLowMobilityCount) / previousLowMobilityCount) * 100)
      : 100;

    return {
      symptom: "Reduced mobility",
      currentWeekCount: currentLowMobilityCount,
      previousWeekCount: previousLowMobilityCount,
      changePercent,
      severity: currentLowMobilityCount >= 4 ? "red" : "yellow",
      message: `⚠️ Reduced mobility logged ${currentLowMobilityCount}x this week (up from ${previousLowMobilityCount}x last week)`,
    };
  }

  return null;
}
