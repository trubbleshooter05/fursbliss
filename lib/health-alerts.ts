import type { HealthLogEntry } from "./health-score";

export type HealthAlert = {
  level: "red" | "yellow" | "green";
  reason: string;
  actionable: string; // What the user should do
};

/**
 * Calculate health alert based on strict red/yellow/green rules
 */
export function calculateHealthAlert(
  entries: HealthLogEntry[],
  petName: string
): HealthAlert {
  if (entries.length < 3) {
    return {
      level: "green",
      reason: `${petName} looking stable`,
      actionable: "Keep up the tracking!",
    };
  }

  // Get last 7 days of data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7Days = entries.filter((e) => e.date >= sevenDaysAgo);

  if (last7Days.length === 0) {
    return {
      level: "green",
      reason: `${petName} looking stable`,
      actionable: "Keep up the tracking!",
    };
  }

  // Check for RED ALERTS (urgent)
  const redAlert = checkRedAlerts(last7Days, entries, petName);
  if (redAlert) return redAlert;

  // Check for YELLOW ALERTS (monitor closely)
  const yellowAlert = checkYellowAlerts(last7Days, entries, petName);
  if (yellowAlert) return yellowAlert;

  // Default: GREEN (all clear)
  return {
    level: "green",
    reason: `All Clear: ${petName} looking stable`,
    actionable: "Keep up the tracking!",
  };
}

/**
 * RED ALERT CHECKS (Urgent - possible vet visit needed)
 */
function checkRedAlerts(
  last7Days: HealthLogEntry[],
  allEntries: HealthLogEntry[],
  petName: string
): HealthAlert | null {
  // 1. Symptom logged 5+ times in 7 days
  const symptomCounts = extractSymptomCounts(last7Days);
  for (const [symptom, count] of Object.entries(symptomCounts)) {
    if (count >= 5) {
      return {
        level: "red",
        reason: `URGENT: ${petName} showing concerning patterns`,
        actionable: `${capitalize(symptom)} logged ${count}x this week. Consider calling your vet today.`,
      };
    }
  }

  // 2. Urgent symptoms present (even once)
  const urgentSymptoms = ["vomiting", "not eating", "seizure", "difficulty breathing", "collapse", "blood"];
  for (const entry of last7Days) {
    const symptoms = extractSymptomsFromEntry(entry);
    for (const symptom of symptoms) {
      const normalized = symptom.toLowerCase();
      if (urgentSymptoms.some((urgent) => normalized.includes(urgent))) {
        return {
          level: "red",
          reason: `URGENT: ${petName} showing concerning patterns`,
          actionable: `${capitalize(symptom)} logged this week. Consider calling your vet today.`,
        };
      }
    }
  }

  // 3. Rapid weight loss (>5% in a week)
  const weights = last7Days.filter((e) => e.weight != null).map((e) => e.weight!);
  if (weights.length >= 2) {
    const oldest = weights[weights.length - 1];
    const newest = weights[0];
    const percentChange = Math.abs(((newest - oldest) / oldest) * 100);
    
    if (percentChange > 5 && newest < oldest) {
      return {
        level: "red",
        reason: `URGENT: ${petName} showing concerning patterns`,
        actionable: `Rapid weight loss: ${percentChange.toFixed(1)}% in a week. Consider calling your vet today.`,
      };
    }
  }

  return null;
}

/**
 * YELLOW ALERT CHECKS (Monitor closely)
 */
function checkYellowAlerts(
  last7Days: HealthLogEntry[],
  allEntries: HealthLogEntry[],
  petName: string
): HealthAlert | null {
  // Get previous week for comparison
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const previousWeek = allEntries.filter(
    (e) => e.date >= fourteenDaysAgo && e.date < sevenDaysAgo
  );

  // 1. Symptom logged 3-4 times this week (up from <2 previous week)
  const currentSymptomCounts = extractSymptomCounts(last7Days);
  const previousSymptomCounts = extractSymptomCounts(previousWeek);

  for (const [symptom, currentCount] of Object.entries(currentSymptomCounts)) {
    const previousCount = previousSymptomCounts[symptom] || 0;
    
    if (currentCount >= 3 && currentCount <= 4 && previousCount < 2) {
      return {
        level: "yellow",
        reason: `WATCH CLOSELY: ${petName} showing changes`,
        actionable: `${capitalize(symptom)} increasing: ${currentCount}x this week (was ${previousCount}x last week). Continue monitoring. Alert your vet if it worsens.`,
      };
    }
  }

  // 2. Gradual weight loss (>2% in a week)
  const weights = last7Days.filter((e) => e.weight != null).map((e) => e.weight!);
  if (weights.length >= 2) {
    const oldest = weights[weights.length - 1];
    const newest = weights[0];
    const percentChange = Math.abs(((newest - oldest) / oldest) * 100);
    
    if (percentChange > 2 && percentChange <= 5 && newest < oldest) {
      return {
        level: "yellow",
        reason: `WATCH CLOSELY: ${petName} showing changes`,
        actionable: `Gradual weight loss: ${percentChange.toFixed(1)}% in a week. Continue monitoring. Alert your vet if it worsens.`,
      };
    }
  }

  // 3. Energy marked "low" 4+ days in a row
  const lowEnergyStreak = checkLowEnergyStreak(last7Days);
  if (lowEnergyStreak >= 4) {
    return {
      level: "yellow",
      reason: `WATCH CLOSELY: ${petName} showing changes`,
      actionable: `Energy marked low ${lowEnergyStreak} days in a row. Continue monitoring. Alert your vet if it worsens.`,
    };
  }

  // 4. Any symptom increasing week-over-week
  for (const [symptom, currentCount] of Object.entries(currentSymptomCounts)) {
    const previousCount = previousSymptomCounts[symptom] || 0;
    
    if (currentCount > previousCount && currentCount >= 2) {
      return {
        level: "yellow",
        reason: `WATCH CLOSELY: ${petName} showing changes`,
        actionable: `${capitalize(symptom)} increasing: ${currentCount}x this week (up from ${previousCount}x last week). Continue monitoring. Alert your vet if it worsens.`,
      };
    }
  }

  return null;
}

/**
 * Helper: Extract symptom counts from entries
 */
function extractSymptomCounts(entries: HealthLogEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const entry of entries) {
    const symptoms = extractSymptomsFromEntry(entry);
    for (const symptom of symptoms) {
      const normalized = symptom.toLowerCase().trim();
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
  }

  return counts;
}

/**
 * Helper: Extract symptoms array from a single entry
 */
function extractSymptomsFromEntry(entry: HealthLogEntry): string[] {
  if (!entry.symptoms) return [];

  try {
    const parsed = JSON.parse(entry.symptoms);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return entry.symptoms.split(",").map((s) => s.trim());
  }
}

/**
 * Helper: Check for consecutive low energy days
 */
function checkLowEnergyStreak(entries: HealthLogEntry[]): number {
  const sorted = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  let streak = 0;
  for (const entry of sorted) {
    if (entry.energyLevel < 4) {
      streak++;
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

/**
 * Helper: Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
