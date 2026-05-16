import { getLifeExpectancyForBreed } from "@/lib/breed-data";

export type QuizScoreBand = "critical" | "improve" | "optimize" | "excellent";

export function getQuizScoreBand(score: number): QuizScoreBand {
  if (score <= 45) return "critical";
  if (score <= 64) return "improve";
  if (score <= 79) return "optimize";
  return "excellent";
}

export function getScoreInterpretation(score: number, dogName: string) {
  const band = getQuizScoreBand(score);
  if (band === "critical") {
    return `${dogName} could benefit from more active monitoring. A few simple changes can make a real difference.`;
  }
  if (band === "improve") {
    return `Good start — ${dogName} has a healthy baseline with clear room to build on.`;
  }
  if (band === "optimize") {
    return `${dogName} is on a strong path. A little more consistency here could add real quality time.`;
  }
  return `${dogName} is in great shape for the long haul. Keep the habits going.`;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getBreedTrackingLift(breed: string) {
  const normalized = breed.trim().toLowerCase();
  const offset = hashString(normalized) % 9; // 0-8
  return 19 + offset; // 19-27 points
}

export function getLoyEligibility(age: number, weight: number) {
  if (age >= 10 && weight >= 14) {
    return {
      status: "Likely eligible window",
      breedStatus: "potentially eligible now",
    };
  }
  if (age >= 8 && weight >= 12) {
    return {
      status: "Near-eligible, watch timeline",
      breedStatus: "potentially eligible soon",
    };
  }
  return {
    status: "Not yet in target window",
    breedStatus: "not yet in an eligible age/weight window",
  };
}

export function getBreedRiskCount(breed: string) {
  return 3 + (hashString(breed) % 4); // 3-6
}

export function getSupplementCount(age: number, concern: string) {
  const concernBoost = concern.includes("joint") || concern.includes("mobility") ? 1 : 0;
  return Math.min(5, Math.max(2, Math.round(age / 4) + 1 + concernBoost));
}

export function getBreedLifespanRange(breed: string, weight: number) {
  const range = getLifeExpectancyForBreed(breed, weight);
  return `${range.low}-${range.high}`;
}
