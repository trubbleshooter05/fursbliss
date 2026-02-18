"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type EligibilityCheckerProps = {
  defaultAge?: number;
  defaultWeight?: number;
  defaultSpecies?: string;
  defaultGeneralHealth?: string;
  petName?: string;
};

export function EligibilityChecker({
  defaultAge = 10,
  defaultWeight = 14,
  defaultSpecies = "dog",
  defaultGeneralHealth = "good",
  petName,
}: EligibilityCheckerProps) {
  const [age, setAge] = useState(String(defaultAge));
  const [weight, setWeight] = useState(String(defaultWeight));
  const [species, setSpecies] = useState(defaultSpecies);
  const [generalHealth, setGeneralHealth] = useState(defaultGeneralHealth);
  const [checked, setChecked] = useState(false);

  const result = useMemo(() => {
    const numericAge = Number(age);
    const numericWeight = Number(weight);
    const isDog = species.toLowerCase() === "dog";
    const normalizedHealth = generalHealth.trim().toLowerCase();
    const goodGeneralHealth = ["good", "stable", "excellent"].includes(normalizedHealth);

    const loyAgeOk = Number.isFinite(numericAge) && numericAge >= 10;
    const loyWeightOk = Number.isFinite(numericWeight) && numericWeight >= 14;

    const triadAgeOk = Number.isFinite(numericAge) && numericAge >= 7;
    const triadWeightOk = Number.isFinite(numericWeight) && numericWeight >= 44;

    return {
      isDog,
      loyAgeOk,
      loyWeightOk,
      triadAgeOk,
      triadWeightOk,
      goodGeneralHealth,
      loyEligible: isDog && loyAgeOk && loyWeightOk,
      triadEligible: isDog && triadAgeOk && triadWeightOk && goodGeneralHealth,
      numericAge,
      numericWeight,
    };
  }, [age, weight, species, generalHealth]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          value={age}
          onChange={(event) => setAge(event.target.value)}
          placeholder="Age (years)"
          inputMode="decimal"
        />
        <Input
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="Weight (lbs)"
          inputMode="decimal"
        />
        <Input
          value={species}
          onChange={(event) => setSpecies(event.target.value)}
          placeholder="Species"
        />
      </div>
      <Input
        value={generalHealth}
        onChange={(event) => setGeneralHealth(event.target.value)}
        placeholder="General health (good/stable/excellent)"
      />
      <Button onClick={() => setChecked(true)}>Check eligibility</Button>
      {checked && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-900">
            Longevity eligibility check{petName ? ` for ${petName}` : ""}
          </p>
          <div className="space-y-2 text-muted-foreground rounded-xl border border-slate-200 bg-white p-3">
            <p className="font-medium text-slate-900">LOY-002 (Loyal)</p>
            <p>
              {result.loyAgeOk ? "✅" : "⬜"} Age: {result.numericAge || 0} years
              (requires 10+)
            </p>
            <p>
              {result.loyWeightOk ? "✅" : "⬜"} Weight: {result.numericWeight || 0} lbs
              (requires 14+ lbs)
            </p>
            <p>
              {result.isDog ? "✅" : "⬜"} Species: {species || "unknown"} (requires
              dog)
            </p>
            <Badge
              className={
                result.loyEligible
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-amber-500/10 text-amber-700"
              }
            >
              {result.loyEligible
                ? "Appears eligible for LOY-002"
                : "Not currently eligible for LOY-002"}
            </Badge>
          </div>
          <div className="space-y-2 text-muted-foreground rounded-xl border border-slate-200 bg-white p-3">
            <p className="font-medium text-slate-900">TRIAD Rapamycin (research trial)</p>
            <p>
              {result.triadAgeOk ? "✅" : "⬜"} Age: {result.numericAge || 0} years
              (requires 7+)
            </p>
            <p>
              {result.triadWeightOk ? "✅" : "⬜"} Weight: {result.numericWeight || 0} lbs
              (requires 44+ lbs)
            </p>
            <p>
              {result.goodGeneralHealth ? "✅" : "⬜"} General health: {generalHealth || "unknown"}
              {" "}(recommended: good/stable)
            </p>
            <p>
              {result.isDog ? "✅" : "⬜"} Species: {species || "unknown"} (requires
              dog)
            </p>
            <Badge
              className={
                result.triadEligible
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-amber-500/10 text-amber-700"
              }
            >
              {result.triadEligible
                ? "Appears eligible for TRIAD screening"
                : "May not meet TRIAD screening criteria"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Eligibility checks are informational only. Final trial screening and treatment decisions
            require veterinary and study-team review.
          </p>
        </div>
      )}
    </div>
  );
}
