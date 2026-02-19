const LOY002_MIN_AGE = 10;
const LOY002_MIN_WEIGHT = 14;

type BreedSizeCategory = "small" | "medium" | "large" | "giant";

const SIZE_CATEGORY_LIFESPAN: Record<
  BreedSizeCategory,
  { averageYears: number; rangeLabel: string }
> = {
  small: { averageYears: 14, rangeLabel: "12-16 years" },
  medium: { averageYears: 12, rangeLabel: "10-14 years" },
  large: { averageYears: 10, rangeLabel: "8-12 years" },
  giant: { averageYears: 8, rangeLabel: "6-10 years" },
};

const CONCERN_COPY: Record<string, string> = {
  joint_mobility: "Track mobility and stiffness daily, then review trends with your vet.",
  energy: "Track energy and recovery patterns to surface subtle decline earlier.",
  weight: "Log weight weekly and adjust nutrition with your veterinarian's guidance.",
  cognitive: "Monitor sleep, orientation, and behavior changes to catch cognitive shifts.",
  loy002: "Maintain a consistent readiness log for LOY-002 vet discussions.",
  general_longevity: "Focus on consistent routines: movement, sleep, nutrition, and recovery.",
};

export type BuildLongevityReadinessReportInput = {
  dogName: string;
  breed: string;
  age: number;
  weight: number;
  concerns: string[];
  score: number;
  breedAverageLifespan?: number | null;
};

export type LongevityReadinessReportPayload = {
  generatedAtIso: string;
  dog: {
    name: string;
    breed: string;
    age: number;
    weight: number;
    concerns: string[];
  };
  longevityScore: {
    value: number;
    interpretation: string;
  };
  loy002Eligibility: {
    isEligible: boolean;
    statusLabel: string;
    detail: string;
  };
  breedLifespan: {
    averageYears: number;
    referenceLabel: string;
    source: "breed_profile" | "size_category";
  };
  nextSteps: string[];
  disclaimer: string;
};

function getScoreInterpretation(score: number) {
  if (score >= 80) return "Strong readiness. Maintain consistency and document trends.";
  if (score >= 60) return "Good baseline. Continue tracking to improve launch readiness.";
  if (score >= 40) return "Developing readiness. Build a stronger daily health record.";
  return "Early readiness stage. Start consistent tracking and vet-reviewed planning.";
}

function inferSizeCategory(breed: string, weight: number): BreedSizeCategory {
  const b = breed.toLowerCase();
  if (b.includes("chihuahua") || b.includes("toy") || b.includes("yorkie")) return "small";
  if (b.includes("great dane") || b.includes("mastiff") || b.includes("saint bernard"))
    return "giant";
  if (
    b.includes("labrador") ||
    b.includes("golden") ||
    b.includes("german shepherd") ||
    b.includes("doberman")
  ) {
    return "large";
  }

  if (weight >= 90) return "giant";
  if (weight >= 50) return "large";
  if (weight >= 20) return "medium";
  return "small";
}

function buildLoy002Status(age: number, weight: number) {
  const ageMet = age >= LOY002_MIN_AGE;
  const weightMet = weight >= LOY002_MIN_WEIGHT;
  const isEligible = ageMet && weightMet;

  if (isEligible) {
    return {
      isEligible: true,
      statusLabel: "Appears eligible",
      detail: `Meets common readiness thresholds (${LOY002_MIN_AGE}+ years and ${LOY002_MIN_WEIGHT}+ lbs).`,
    };
  }

  const missing: string[] = [];
  if (!ageMet) missing.push(`age ${LOY002_MIN_AGE}+`);
  if (!weightMet) missing.push(`weight ${LOY002_MIN_WEIGHT}+ lbs`);

  return {
    isEligible: false,
    statusLabel: "Not yet eligible",
    detail: `Currently below ${missing.join(" and ")} threshold${missing.length > 1 ? "s" : ""}.`,
  };
}

function dedupeConcerns(concerns: string[]) {
  return [...new Set(concerns.map((c) => c.trim()).filter(Boolean))];
}

function buildNextSteps(input: {
  dogName: string;
  concerns: string[];
  eligibleForLoy002: boolean;
  age: number;
  weight: number;
}) {
  const steps: string[] = [
    `Log ${input.dogName}'s daily mobility, appetite, energy, and recovery so your vet has day-one baseline history.`,
  ];

  for (const concern of input.concerns) {
    const mapped = CONCERN_COPY[concern];
    if (mapped && !steps.includes(mapped)) {
      steps.push(mapped);
      break;
    }
  }

  steps.push(
    input.eligibleForLoy002
      ? "Discuss LOY-002 readiness with your veterinarian and keep documentation updated monthly."
      : `Track eligibility milestones over time (${LOY002_MIN_AGE}+ years, ${LOY002_MIN_WEIGHT}+ lbs) and revisit with your vet.`
  );

  if (steps.length < 3) {
    steps.push(
      "Run medication and supplement plans through an interaction checker before introducing changes."
    );
  }

  return steps.slice(0, 3);
}

export function buildLongevityReadinessReportPayload(
  input: BuildLongevityReadinessReportInput
): LongevityReadinessReportPayload {
  const normalizedConcerns = dedupeConcerns(input.concerns);
  const sizeCategory = inferSizeCategory(input.breed, input.weight);
  const sizeReference = SIZE_CATEGORY_LIFESPAN[sizeCategory];
  const averageYears = input.breedAverageLifespan ?? sizeReference.averageYears;
  const loy002Status = buildLoy002Status(input.age, input.weight);

  return {
    generatedAtIso: new Date().toISOString(),
    dog: {
      name: input.dogName,
      breed: input.breed,
      age: input.age,
      weight: input.weight,
      concerns: normalizedConcerns,
    },
    longevityScore: {
      value: input.score,
      interpretation: getScoreInterpretation(input.score),
    },
    loy002Eligibility: loy002Status,
    breedLifespan: {
      averageYears,
      referenceLabel:
        input.breedAverageLifespan != null
          ? `${input.breed} average lifespan reference`
          : `${sizeCategory[0].toUpperCase()}${sizeCategory.slice(1)} breed reference (${sizeReference.rangeLabel})`,
      source: input.breedAverageLifespan != null ? "breed_profile" : "size_category",
    },
    nextSteps: buildNextSteps({
      dogName: input.dogName,
      concerns: normalizedConcerns,
      eligibleForLoy002: loy002Status.isEligible,
      age: input.age,
      weight: input.weight,
    }),
    disclaimer:
      "Informational only. This report does not replace veterinary diagnosis, treatment, or prescribing decisions.",
  };
}
