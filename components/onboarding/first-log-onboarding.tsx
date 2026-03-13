"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trackMetaCustomEvent } from "@/lib/meta-events";

type Pet = { id: string; name: string; photoUrl: string | null };

type FirstLogOnboardingProps = { pet: Pet };

const STEPS = ["intro", "energy", "appetite", "mobility", "notes", "result"] as const;

export function FirstLogOnboarding({ pet }: FirstLogOnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState<(typeof STEPS)[number]>("intro");
  const [energy, setEnergy] = useState(7);
  const [appetite, setAppetite] = useState(7);
  const [mobility, setMobility] = useState(7);
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [submitting, setSubmitting] = useState(false);

  const startWizard = () => {
    trackMetaCustomEvent("Onboarding_FirstLog_Started", { petId: pet.id, petName: pet.name });
    setStep("energy");
  };

  const nextStep = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const submitLog = async () => {
    setSubmitting(true);
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petId: pet.id,
        date: today,
        energyLevel: energy,
        appetiteLevel: appetite,
        mobilityLevel: mobility,
        notes: notes.trim() || undefined,
      }),
    });

    if (!res.ok) {
      setSubmitting(false);
      return;
    }

    trackMetaCustomEvent("Onboarding_FirstLog_Completed", {
      petId: pet.id,
      petName: pet.name,
      energy,
      appetite,
      mobility,
    });

    setSubmitting(false);
    setStep("result");
  };

  const goToDashboard = async () => {
    if (reminderEnabled) {
      await fetch("/api/user/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: true,
          time: reminderTime,
          petId: pet.id,
        }),
      });
      trackMetaCustomEvent("Onboarding_Reminder_Enabled", {
        petId: pet.id,
        petName: pet.name,
      });
    }
    router.push("/dashboard");
    router.refresh();
  };

  const stepIndex = STEPS.indexOf(step);
  const progressPct = stepIndex >= 0 ? (stepIndex / (STEPS.length - 2)) * 100 : 0; // exclude intro and result

  const SliderStep = ({
    label,
    value,
    onChange,
    onNext,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    onNext: () => void;
  }) => (
    <Card className="w-full border-2 shadow-xl">
      <CardHeader className="pb-2">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <h2 className="text-xl font-semibold pt-4">{label}</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 justify-center flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-11 h-11 rounded-full text-sm font-medium transition-all ${
                value === n
                  ? "bg-primary text-primary-foreground scale-110"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {value} {value === 1 ? "— Low" : value === 10 ? "— Great" : ""}
        </p>
        <Button onClick={onNext} className="w-full h-11">
          Next
        </Button>
      </CardContent>
    </Card>
  );

  if (step === "intro") {
    return (
      <Card className="w-full overflow-hidden border-2 shadow-xl">
        <CardContent className="p-0">
          {pet.photoUrl && (
            <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pet.photoUrl}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8 space-y-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-center">
              Let&apos;s do {pet.name}&apos;s first health check
            </h1>
            <p className="text-muted-foreground text-center">Takes 30 seconds</p>
            <Button onClick={startWizard} size="lg" className="w-full h-12 text-base">
              Start Check-In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "energy") {
    return (
      <SliderStep
        label={`How's ${pet.name}'s energy today?`}
        value={energy}
        onChange={setEnergy}
        onNext={nextStep}
      />
    );
  }

  if (step === "appetite") {
    return (
      <SliderStep
        label={`How's their appetite?`}
        value={appetite}
        onChange={setAppetite}
        onNext={nextStep}
      />
    );
  }

  if (step === "mobility") {
    return (
      <SliderStep
        label={`Any mobility issues?`}
        value={mobility}
        onChange={setMobility}
        onNext={nextStep}
      />
    );
  }

  if (step === "notes") {
    return (
      <Card className="w-full border-2 shadow-xl">
        <CardHeader className="pb-2">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: "100%" }}
            />
          </div>
          <h2 className="text-xl font-semibold pt-4">Anything else you noticed?</h2>
          <p className="text-sm text-muted-foreground">Optional</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g. limping a bit, slept more than usual..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button onClick={submitLog} className="w-full h-11" disabled={submitting}>
            {submitting ? "Saving..." : "Complete"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "result") {
    const ScoreBar = ({ value, label }: { value: number; label: string }) => (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-semibold">{value}/10</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
      </div>
    );

    return (
      <Card className="w-full border-2 shadow-xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {pet.name}&apos;s first wellness snapshot
          </h2>
          <p className="text-sm text-muted-foreground">
            Energy {energy}, Appetite {appetite}, Mobility {mobility}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <ScoreBar value={energy} label="Energy" />
            <ScoreBar value={appetite} label="Appetite" />
            <ScoreBar value={mobility} label="Mobility" />
          </div>

          <p className="text-sm text-muted-foreground">
            Come back tomorrow and we&apos;ll start tracking trends.
          </p>

          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <p className="font-medium">Want a reminder?</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Daily reminder</span>
              </label>
              {reminderEnabled && (
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="rounded border px-2 py-1 text-sm"
                />
              )}
            </div>
          </div>

          <Button onClick={goToDashboard} className="w-full h-11">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
