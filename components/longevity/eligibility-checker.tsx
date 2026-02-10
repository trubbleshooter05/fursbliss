"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type EligibilityCheckerProps = {
  defaultAge?: number;
  defaultWeight?: number;
  defaultSpecies?: string;
  petName?: string;
};

export function EligibilityChecker({
  defaultAge = 10,
  defaultWeight = 14,
  defaultSpecies = "dog",
  petName,
}: EligibilityCheckerProps) {
  const [age, setAge] = useState(String(defaultAge));
  const [weight, setWeight] = useState(String(defaultWeight));
  const [species, setSpecies] = useState(defaultSpecies);
  const [checked, setChecked] = useState(false);

  const result = useMemo(() => {
    const numericAge = Number(age);
    const numericWeight = Number(weight);
    const isDog = species.toLowerCase() === "dog";
    const ageOk = Number.isFinite(numericAge) && numericAge >= 10;
    const weightOk = Number.isFinite(numericWeight) && numericWeight >= 14;
    return {
      isDog,
      ageOk,
      weightOk,
      eligible: isDog && ageOk && weightOk,
      numericAge,
      numericWeight,
    };
  }, [age, weight, species]);

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
      <Button onClick={() => setChecked(true)}>Check eligibility</Button>
      {checked && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-900">
            LOY-002 Eligibility Check{petName ? ` for ${petName}` : ""}
          </p>
          <div className="space-y-2 text-muted-foreground">
            <p>
              {result.ageOk ? "✅" : "⬜"} Age: {result.numericAge || 0} years
              (requires 10+)
            </p>
            <p>
              {result.weightOk ? "✅" : "⬜"} Weight: {result.numericWeight || 0} lbs
              (requires 14+ lbs)
            </p>
            <p>
              {result.isDog ? "✅" : "⬜"} Species: {species || "unknown"} (requires
              dog)
            </p>
          </div>
          <Badge
            className={
              result.eligible
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-amber-500/10 text-amber-700"
            }
          >
            {result.eligible
              ? "Appears eligible for LOY-002"
              : "Not currently eligible"}
          </Badge>
        </div>
      )}
    </div>
  );
}
