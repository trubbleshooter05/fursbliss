import type { HealthLogEntry } from "./health-score";

export type PatternAlert = {
  symptom: string;
  currentWeekCount: number;
  previousWeekCount: number;
  changePercent: number;
  severity: "red" | "yellow";
  message: string;
  category: "symptom" | "energy" | "appetite" | "mobility" | "weight" | "combo";
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

  // NEW: Check for weight trends
  const weightPattern = analyzeWeightTrend(sortedEntries);
  if (weightPattern) alerts.push(weightPattern);

  // NEW: Check for symptom combinations (red flags)
  const comboPatterns = analyzeSymptomCombinations(currentWeekEntries);
  alerts.push(...comboPatterns);

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
        category: "symptom",
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
      category: "energy",
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
      category: "appetite",
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
      category: "mobility",
    };
  }

  return null;
}

/**
 * NEW: Analyze weight trends over time
 */
function analyzeWeightTrend(entries: HealthLogEntry[]): PatternAlert | null {
  const weightsWithDates = entries
    .filter((e) => e.weight != null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (weightsWithDates.length < 3) return null;

  // Check last 14 days of weight data
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const recentWeights = weightsWithDates.filter((e) => e.date >= twoWeeksAgo);

  if (recentWeights.length < 2) return null;

  const mostRecent = recentWeights[0].weight!;
  const oldest = recentWeights[recentWeights.length - 1].weight!;
  const percentChange = ((mostRecent - oldest) / oldest) * 100;
  const absChange = Math.abs(percentChange);

  // Red flag: >5% weight change in 2 weeks
  if (absChange > 5) {
    const direction = percentChange > 0 ? "gained" : "lost";
    return {
      symptom: "Rapid weight change",
      currentWeekCount: 0, // Not frequency-based
      previousWeekCount: 0,
      changePercent: Math.round(absChange * 10) / 10,
      severity: "red",
      message: `🚨 ${direction} ${Math.abs(mostRecent - oldest).toFixed(1)} lbs (${absChange.toFixed(1)}%) in 2 weeks — vet check recommended`,
      category: "weight",
    };
  }

  // Yellow flag: >3% weight change in 2 weeks
  if (absChange > 3) {
    const direction = percentChange > 0 ? "gaining" : "losing";
    return {
      symptom: "Weight trending",
      currentWeekCount: 0,
      previousWeekCount: 0,
      changePercent: Math.round(absChange * 10) / 10,
      severity: "yellow",
      message: `⚠️ Weight ${direction}: ${absChange.toFixed(1)}% change in 2 weeks — monitor closely`,
      category: "weight",
    };
  }

  return null;
}

/**
 * NEW: Detect dangerous symptom combinations
 */
function analyzeSymptomCombinations(currentWeek: HealthLogEntry[]): PatternAlert[] {
  const alerts: PatternAlert[] = [];

  if (currentWeek.length < 3) return alerts;

  const symptoms = extractSymptoms(currentWeek);
  const symptomKeys = Object.keys(symptoms).map((s) => s.toLowerCase());

  // Red flag combos that suggest serious issues
  const dangerousCombos: Array<{ symptoms: string[]; message: string; name: string }> = [
    {
      symptoms: ["vomiting", "diarrhea"],
      name: "GI distress",
      message: "🚨 Vomiting + diarrhea logged this week — dehydration risk, consider ER triage",
    },
    {
      symptoms: ["vomiting", "not eating", "lethargy"],
      name: "Severe illness signs",
      message: "🚨 Vomiting + poor appetite + lethargy — multiple warning signs, vet visit recommended",
    },
    {
      symptoms: ["coughing", "breathing", "labored"],
      name: "Respiratory distress",
      message: "🚨 Breathing issues + coughing — respiratory distress, urgent vet check needed",
    },
    {
      symptoms: ["limping", "swelling"],
      name: "Joint/injury concern",
      message: "⚠️ Limping + swelling logged — possible injury or joint inflammation",
    },
    {
      symptoms: ["seizure", "collapse"],
      name: "Neurological emergency",
      message: "🚨 Seizure or collapse logged — EMERGENCY, contact vet immediately",
    },
  ];

  for (const combo of dangerousCombos) {
    const matchedSymptoms = combo.symptoms.filter((s) =>
      symptomKeys.some((key) => key.includes(s) || s.includes(key))
    );

    // If 2+ symptoms from combo are present
    if (matchedSymptoms.length >= 2) {
      const totalCount = matchedSymptoms.reduce((sum, s) => {
        const key = symptomKeys.find((k) => k.includes(s) || s.includes(k));
        return sum + (key ? symptoms[key] || 0 : 0);
      }, 0);

      alerts.push({
        symptom: combo.name,
        currentWeekCount: totalCount,
        previousWeekCount: 0,
        changePercent: 0,
        severity: combo.message.startsWith("🚨") ? "red" : "yellow",
        message: combo.message,
        category: "combo",
      });
    }
  }

  // Yellow flag: Multiple symptoms at once
  const uniqueSymptomCount = Object.keys(symptoms).length;
  if (uniqueSymptomCount >= 3) {
    const totalSymptomLogs = Object.values(symptoms).reduce((sum, count) => sum + count, 0);
    if (totalSymptomLogs >= 5) {
      alerts.push({
        symptom: "Multiple symptoms",
        currentWeekCount: uniqueSymptomCount,
        previousWeekCount: 0,
        changePercent: 0,
        severity: "yellow",
        message: `⚠️ ${uniqueSymptomCount} different symptoms logged this week — monitor for worsening`,
        category: "combo",
      });
    }
  }

  return alerts;
}
