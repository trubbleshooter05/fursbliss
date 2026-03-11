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
  defaultAge,
  defaultWeight,
  defaultSpecies = "dog",
  defaultGeneralHealth = "",
  petName,
}: EligibilityCheckerProps) {
  const [age, setAge] = useState(defaultAge != null ? String(defaultAge) : "");
  const [weight, setWeight] = useState(defaultWeight != null ? String(defaultWeight) : "");
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

          <div className="space-y-2 text-muted-foreground rounded-xl border border-emerald-200 bg-white p-3">
            <p className="font-medium text-slate-900">LOY-002 (Loyal) — FDA-approved lifespan extension</p>
            <p className="text-xs text-muted-foreground">
              For senior dogs. Expected to be broadly available via veterinary prescription.
            </p>
            <div className="mt-2 space-y-1">
              <p>
                {result.loyAgeOk ? "✅" : "⬜"} Age: {result.numericAge || "—"} years
                (requires 10+)
              </p>
              <p>
                {result.loyWeightOk ? "✅" : "⬜"} Weight: {result.numericWeight || "—"} lbs
                (requires 14+ lbs)
              </p>
              <p>
                {result.isDog ? "✅" : "⬜"} Species: {species || "unknown"} (dogs only)
              </p>
            </div>
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
            <p className="font-medium text-slate-900">TRIAD Rapamycin — separate research trial</p>
            <p className="text-xs text-muted-foreground">
              A different study from LOY-002 with stricter weight requirements. Still enrolling across 20 trial sites.
            </p>
            <div className="mt-2 space-y-1">
              <p>
                {result.triadAgeOk ? "✅" : "⬜"} Age: {result.numericAge || "—"} years
                (requires 7+)
              </p>
              <p>
                {result.triadWeightOk ? "✅" : "⬜"} Weight: {result.numericWeight || "—"} lbs
                (requires 44+ lbs — this is specific to the TRIAD trial, not LOY-002)
              </p>
              <p>
                {result.goodGeneralHealth ? "✅" : "⬜"} General health: {generalHealth || "not entered"}
                {" "}(recommended: good/stable)
              </p>
              <p>
                {result.isDog ? "✅" : "⬜"} Species: {species || "unknown"} (dogs only)
              </p>
            </div>
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
            Eligibility checks are informational only. LOY-002 and TRIAD are two separate programs with different
            requirements. Final screening and treatment decisions require veterinary review.
          </p>
        </div>
      )}
    </div>
  );
}
