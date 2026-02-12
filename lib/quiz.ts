export const QUIZ_CONCERNS = [
  { key: "joint_mobility", label: "Joint pain / mobility decline" },
  { key: "energy", label: "Energy / lethargy" },
  { key: "weight", label: "Weight management" },
  { key: "cognitive", label: "Cognitive decline" },
  { key: "loy002", label: "Preparing for LOY-002" },
  { key: "general_longevity", label: "General longevity / more years together" },
] as const;

export type QuizConcernKey = (typeof QUIZ_CONCERNS)[number]["key"];

export function calculateLongevityScore(input: {
  age: number;
  weight: number;
  concerns: string[];
  breedAvgLifespan: number;
}) {
  let score = 30;

  if (input.age >= 10 && input.weight >= 14) {
    score += 20;
  } else if (input.age >= 7) {
    score += 10;
  }

  const runway = input.breedAvgLifespan - input.age;
  if (runway > 3) {
    score += 15;
  } else if (runway > 1) {
    score += 10;
  } else {
    score += 5;
  }

  if (input.concerns.includes("loy002")) {
    score += 10;
  }
  if (input.concerns.length >= 2) {
    score += 5;
  }
  if (input.concerns.includes("joint_mobility") || input.concerns.includes("energy")) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

export function buildQuizRecommendations(input: {
  dogName: string;
  breed: string;
  age: number;
  weight: number;
  concerns: string[];
  score: number;
}) {
  const recs: string[] = [];
  if (input.age >= 10 && input.weight >= 14) {
    recs.push(
      `${input.dogName} may qualify for LOY-002 when it launches. Join the waitlist to get updates first.`
    );
  }

  if (input.concerns.includes("joint_mobility")) {
    recs.push(
      `Mobility support for ${input.breed}: consider discussing glucosamine-based joint support with your veterinarian.`
    );
  } else if (input.concerns.includes("energy")) {
    recs.push(
      `Energy support plan: discuss omega-3s and CoQ10 options for ${input.dogName} with your vet.`
    );
  }

  recs.push(
    `Start tracking ${input.dogName}'s daily health signals to improve this readiness score over time.`
  );
  return recs.slice(0, 3);
}

