export type SymptomSeverityBand = "mild" | "moderate" | "severe";

export type RedFlagInput = Record<string, boolean>;

/** Map symptom checker inputs to a 0–10 severity score. */
export function computeSymptomSeverityScore(
  severity: SymptomSeverityBand,
  redFlags: RedFlagInput
): number {
  const base = { mild: 3, moderate: 6, severe: 9 }[severity];
  const redCount = Object.values(redFlags).filter(Boolean).length;
  return Math.min(10, base + Math.min(2, redCount * 0.5));
}

export function shouldShowUrgentUpsell(score: number): boolean {
  return score >= 6;
}
