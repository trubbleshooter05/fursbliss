"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PetOption = {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
};

type TriageWorkbenchProps = {
  pets: PetOption[];
  isPremium: boolean;
};

type TriageResponse = {
  urgency?: {
    urgencyLevel: "EMERGENCY_NOW" | "VET_TODAY" | "VET_SOON" | "HOME_MONITOR";
    urgencyReason: string;
  };
  premiumRequired?: boolean;
  preview?: string[];
  detailed?: {
    likelyCategories: string[];
    whatToMonitorNext24h: string[];
    homeCareSteps: string[];
    vetPrepChecklist: string[];
    emergencyRedFlagsNow: string[];
    disclaimer: string;
  };
  warning?: string;
};

const emergencyFlagOptions = [
  "Difficulty breathing",
  "Collapse or fainting",
  "Seizure",
  "Uncontrolled bleeding",
  "Vomiting blood",
  "Bloody stool",
  "Severe pain",
  "Repeated vomiting",
];

const durationOptions = [
  "Less than 1 hour",
  "1-6 hours",
  "6-24 hours",
  "1-3 days",
  "More than 3 days",
];

function urgencyBadge(level?: string) {
  if (level === "EMERGENCY_NOW") return "bg-rose-100 text-rose-700";
  if (level === "VET_TODAY") return "bg-orange-100 text-orange-700";
  if (level === "VET_SOON") return "bg-yellow-100 text-yellow-700";
  return "bg-emerald-100 text-emerald-700";
}

export function ErTriageWorkbench({ pets, isPremium }: TriageWorkbenchProps) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? "");
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("1-6 hours");
  const [behaviorChanges, setBehaviorChanges] = useState("");
  const [eatingDrinking, setEatingDrinking] = useState("");
  const [bathroomChanges, setBathroomChanges] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResponse | null>(null);

  const selectedPet = useMemo(() => pets.find((pet) => pet.id === selectedPetId) ?? null, [pets, selectedPetId]);

  const runTriage = async () => {
    if (!selectedPet) {
      setError("Select a pet first.");
      return;
    }
    if (symptoms.trim().length < 10) {
      setError("Please enter more symptom detail.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai/er-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPet.id,
          symptoms,
          duration,
          behaviorChanges,
          eatingDrinking,
          bathroomChanges,
          emergencyFlags: flags,
        }),
      });

      const payload = (await response.json()) as TriageResponse & { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to run triage.");
      }
      setResult(payload);
    } catch (triageError) {
      setError(triageError instanceof Error ? triageError.message : "Unable to run triage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Describe symptoms before heading to ER</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Pet profile</p>
            <Select value={selectedPetId} onValueChange={setSelectedPetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name} ({pet.breed}, {pet.age}y, {pet.weight} lbs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <textarea
            className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Describe symptoms in detail..."
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Behavior changes (optional)"
              value={behaviorChanges}
              onChange={(event) => setBehaviorChanges(event.target.value)}
            />
            <Input
              placeholder="Eating/drinking changes (optional)"
              value={eatingDrinking}
              onChange={(event) => setEatingDrinking(event.target.value)}
            />
            <Input
              placeholder="Bathroom changes (optional)"
              value={bathroomChanges}
              onChange={(event) => setBathroomChanges(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Emergency red flags seen right now</p>
            <div className="flex flex-wrap gap-2">
              {emergencyFlagOptions.map((flag) => {
                const selected = flags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() =>
                      setFlags((prev) =>
                        prev.includes(flag) ? prev.filter((item) => item !== flag) : [...prev, flag]
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      selected
                        ? "border-rose-300 bg-rose-100 text-rose-700"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {flag}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={runTriage} disabled={loading} className="min-h-12">
            {loading ? "Analyzing..." : "Run ER Triage"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {result?.urgency ? (
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Triage result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${urgencyBadge(result.urgency.urgencyLevel)}`}
            >
              {result.urgency.urgencyLevel.replaceAll("_", " ")}
            </span>
            <p className="text-sm text-foreground">{result.urgency.urgencyReason}</p>
            {result.warning ? <p className="text-sm text-amber-700">{result.warning}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      {result?.premiumRequired && !isPremium ? (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50/60">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Unlock full triage report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-700">
              Premium unlocks likely condition categories, 24-hour monitor checklist, and vet prep guidance.
            </p>
            <div className="rounded-xl border border-amber-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Preview</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {result.preview?.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <Button asChild>
              <a href="/pricing?from=triage">Upgrade to Premium for full report</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {result?.detailed ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Likely categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {result.detailed.likelyCategories.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What to monitor (next 24h)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {result.detailed.whatToMonitorNext24h.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Home care steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {result.detailed.homeCareSteps.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vet prep checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {result.detailed.vetPrepChecklist.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Emergency red flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {result.detailed.emergencyRedFlagsNow.map((item) => (
                <p key={item}>• {item}</p>
              ))}
              <p className="pt-2 text-xs text-slate-500">{result.detailed.disclaimer}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="rounded-2xl border-border bg-muted/30">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          This tool provides triage guidance only and is not a veterinary diagnosis. If your dog looks distressed, seek emergency care immediately.
        </CardContent>
      </Card>
    </div>
  );
}
