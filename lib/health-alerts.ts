import type { HealthLogEntry } from "./health-score";

export type WeeklyCheckIn = {
  energyLevel: string; // "better", "same", "worse", "much_worse"
  appetite: string; // "better", "same", "worse", "much_worse"
  newSymptoms: boolean;
  symptomDetails: string | null;
  vetVisit: boolean;
  createdAt: Date;
};

export type HealthAlert = {
  level: "red" | "yellow" | "green";
  reason: string;
  actionable: string; // What the user should do
  source?: "daily_logs" | "weekly_checkin" | "combined"; // Where the alert came from
};

/**
 * Calculate health alert based on strict red/yellow/green rules
 * Now includes weekly check-in responses for more comprehensive alerting
 */
export function calculateHealthAlert(
  entries: HealthLogEntry[],
  petName: string,
  recentCheckIns?: WeeklyCheckIn[]
): HealthAlert {
  // URGENT CHECK: Even with 1 entry, check for urgent symptoms
  if (entries.length > 0) {
    const urgentCheck = checkUrgentSymptomsAnyTime(entries, petName);
    if (urgentCheck) return urgentCheck;
  }

  // For other patterns, need at least 3 days of data
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

  // Check weekly check-in responses (if provided)
  if (recentCheckIns && recentCheckIns.length > 0) {
    const checkInAlert = checkWeeklyCheckInSignals(recentCheckIns, petName);
    if (checkInAlert) return checkInAlert;
  }

  // Default: GREEN (all clear)
  const greenAlert: HealthAlert = {
    level: "green",
    reason: `All Clear: ${petName} looking stable`,
    actionable: "Keep up the tracking!",
    source: "daily_logs",
  };

  // Add vet visit context if recent
  if (recentCheckIns && recentCheckIns.length > 0 && recentCheckIns[0].vetVisit) {
    greenAlert.actionable += " Recent vet visit reported.";
  }

  return greenAlert;
}

/**
 * URGENT: Check for urgent symptoms in ANY entry (even just 1 log)
 */
function checkUrgentSymptomsAnyTime(
  allEntries: HealthLogEntry[],
  petName: string
): HealthAlert | null {
  const urgentSymptoms = ["vomiting", "not eating", "seizure", "difficulty breathing", "collapse", "blood"];
  
  // Check last 7 days only
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEntries = allEntries.filter((e) => e.date >= sevenDaysAgo);

  for (const entry of recentEntries) {
    const symptoms = extractSymptomsFromEntry(entry);
    for (const symptom of symptoms) {
      const normalized = symptom.toLowerCase();
      const matchedUrgent = urgentSymptoms.find((urgent) => normalized.includes(urgent));
      if (matchedUrgent) {
        return {
          level: "red",
          reason: `🔴 URGENT: ${petName} showing concerning patterns`,
          actionable: `${capitalize(symptom)} logged this week. Consider calling your vet today.`,
        };
      }
    }
  }

  return null;
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
  const allSymptoms: string[] = [];

  // Check symptoms field
  if (entry.symptoms) {
    try {
      const parsed = JSON.parse(entry.symptoms);
      if (Array.isArray(parsed)) {
        allSymptoms.push(...parsed);
      }
    } catch {
      allSymptoms.push(...entry.symptoms.split(",").map((s) => s.trim()));
    }
  }

  // ALSO check notes field for urgent keywords
  if (entry.notes) {
    allSymptoms.push(entry.notes);
  }

  return allSymptoms.filter(Boolean);
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

/**
 * NEW: Check weekly check-in responses for alert signals
 */
function checkWeeklyCheckInSignals(
  checkIns: WeeklyCheckIn[],
  petName: string
): HealthAlert | null {
  // Get most recent check-in
  const latest = checkIns[0];

  // RED ALERT: Both energy AND appetite are worse/much_worse in same check-in
  const energyWorse = latest.energyLevel === "worse" || latest.energyLevel === "much_worse";
  const appetiteWorse = latest.appetite === "worse" || latest.appetite === "much_worse";

  if (energyWorse && appetiteWorse) {
    return {
      level: "red",
      reason: `🔴 URGENT: ${petName} showing concerning patterns`,
      actionable: `Your weekly check-in reported declining energy AND appetite. Consider calling your vet today.`,
      source: "weekly_checkin",
    };
  }

  // YELLOW ALERT: Either energy or appetite is "much_worse"
  if (latest.energyLevel === "much_worse") {
    return {
      level: "yellow",
      reason: `⚠️ WATCH CLOSELY: ${petName} showing changes`,
      actionable: `Your weekly check-in reported much worse energy levels. Continue monitoring. Alert your vet if it worsens.`,
      source: "weekly_checkin",
    };
  }

  if (latest.appetite === "much_worse") {
    return {
      level: "yellow",
      reason: `⚠️ WATCH CLOSELY: ${petName} showing changes`,
      actionable: `Your weekly check-in reported much worse appetite. Continue monitoring. Alert your vet if it worsens.`,
      source: "weekly_checkin",
    };
  }

  // YELLOW ALERT: New symptoms reported
  if (latest.newSymptoms && latest.symptomDetails) {
    return {
      level: "yellow",
      reason: `⚠️ WATCH CLOSELY: ${petName} showing changes`,
      actionable: `Your weekly check-in reported new symptoms: "${latest.symptomDetails}". Continue monitoring. Alert your vet if it worsens.`,
      source: "weekly_checkin",
    };
  }

  return null;
}
