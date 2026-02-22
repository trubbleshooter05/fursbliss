"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-events";

type LongevityQuizProps = {
  breeds: string[];
};

type QuizState = {
  breed: string;
  age: number;
  weight: number;
  topConcern: string;
  supplementsOrMeds: string;
  email: string;
};

type QuizResult = {
  id: string;
  score: number;
};

const CONCERN_OPTIONS: Array<{ id: string; label: string; payloadConcern: string }> = [
  { id: "longevity", label: "Longevity", payloadConcern: "general_longevity" },
  { id: "mobility", label: "Mobility", payloadConcern: "joint_mobility" },
  { id: "energy", label: "Energy", payloadConcern: "energy" },
  { id: "weight", label: "Weight", payloadConcern: "weight" },
  { id: "supplements", label: "Supplements", payloadConcern: "supplements" },
  { id: "loy-002", label: "LOY-002", payloadConcern: "loy002" },
];

export function LongevityQuiz({ breeds }: LongevityQuizProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [state, setState] = useState<QuizState>({
    breed: "",
    age: 10,
    weight: 40,
    topConcern: "",
    supplementsOrMeds: "",
    email: "",
  });

  const TOTAL_STEPS = 4;
  const progress = (step / TOTAL_STEPS) * 100;
  const stepNameByNumber: Record<number, string> = {
    1: "breed_and_age",
    2: "weight_and_top_concern",
    3: "supplements_or_medications",
    4: "email_gate",
  };

  const [quizSessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const existing = window.sessionStorage.getItem("quiz_session_id");
      if (existing) return existing;
      const created = `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem("quiz_session_id", created);
      return created;
    }
    return `quiz_${Date.now()}`;
  });

  useEffect(() => {
    void trackMetaCustomEvent("QuizStarted");
  }, []);

  useEffect(() => {
    if (result) return;
    const stepName = stepNameByNumber[step];
    if (!stepName) return;
    void fetch("/api/quiz/step-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: quizSessionId,
        stepNumber: step,
        stepName,
      }),
    }).catch(() => {
      // Non-blocking analytics write
    });
  }, [quizSessionId, step]);

  const filteredBreeds = useMemo(() => {
    if (!state.breed) return breeds.slice(0, 20);
    const query = state.breed.toLowerCase();
    return breeds.filter((breed) => breed.toLowerCase().includes(query)).slice(0, 20);
  }, [breeds, state.breed]);

  const selectedConcern = useMemo(
    () => CONCERN_OPTIONS.find((option) => option.id === state.topConcern),
    [state.topConcern]
  );

  const canContinue = useMemo(() => {
    if (step === 1) return state.breed.trim().length > 0 && state.age > 0;
    if (step === 2) return state.weight > 0 && state.topConcern.trim().length > 0;
    if (step === 4) return state.email.trim().length > 5 && state.email.includes("@");
    return true;
  }, [state.age, state.breed, state.email, state.topConcern, state.weight, step]);

  const nextStep = () => {
    if (!canContinue || step >= TOTAL_STEPS) return;
    setStep((current) => current + 1);
  };

  const previousStep = () => {
    if (step <= 1) return;
    setStep((current) => current - 1);
  };

  const submitQuiz = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email,
          dogName: "Your Dog",
          breed: state.breed,
          age: state.age,
          weight: state.weight,
          concerns: [selectedConcern?.payloadConcern ?? "general_longevity"],
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to submit quiz.");
      }

      await trackMetaEvent(
        "Lead",
        { content_name: "quiz_email_captured" },
        {
          eventId: typeof payload?.metaEventId === "string" ? payload.metaEventId : undefined,
        }
      );
      await trackMetaCustomEvent("QuizCompleted");
      setResult({
        id: String(payload.id),
        score: Number(payload.score),
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Your score is ready
          </p>
          <CardTitle className="font-display text-3xl text-foreground md:text-4xl">
            Longevity Readiness Score: {result.score}/100
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            We sent this score to {state.email}. Create a free account to track your score over time.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="min-h-12 w-full bg-accent text-accent-foreground hover:brightness-110" asChild>
            <Link
              href={`/signup?email=${encodeURIComponent(state.email)}&breed=${encodeURIComponent(
                state.breed
              )}&age=${encodeURIComponent(String(state.age))}&weight=${encodeURIComponent(
                String(state.weight)
              )}&concerns=${encodeURIComponent(selectedConcern?.payloadConcern ?? "general_longevity")}`}
            >
              Create free account
            </Link>
          </Button>
          <Button variant="outline" className="min-h-11 w-full" asChild>
            <Link href={`/quiz/results/${result.id}`}>View full recommendations</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/90">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="h-2 rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-foreground">
                {step === 1 && "Tell us your dog's breed and age"}
                {step === 2 && "Weight and your top concern"}
                {step === 3 && "Any supplements or medications?"}
                {step === 4 && "Enter your email to get your score"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Breed</label>
                    <Input
                      placeholder="Search breed..."
                      value={state.breed}
                      inputMode="search"
                      autoComplete="off"
                      enterKeyHint="search"
                      onChange={(event) =>
                        setState((prev) => ({ ...prev, breed: event.target.value }))
                      }
                    />
                    <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-border p-2">
                      {filteredBreeds.map((breed) => (
                        <button
                          key={breed}
                          type="button"
                          onClick={() => setState((prev) => ({ ...prev, breed }))}
                          className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                            state.breed === breed
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          {breed}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Age (years)</label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={state.age}
                      onChange={(event) =>
                        setState((prev) => ({
                          ...prev,
                          age: Number(event.target.value || 1),
                        }))
                      }
                    />
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Weight (lbs)</label>
                    <Input
                      type="number"
                      min={1}
                      max={250}
                      value={state.weight}
                      onChange={(event) =>
                        setState((prev) => ({
                          ...prev,
                          weight: Number(event.target.value || 1),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Top concern (pick one)</label>
                    <div className="grid gap-2">
                      {CONCERN_OPTIONS.map((option) => {
                        const isSelected = state.topConcern === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setState((prev) => ({ ...prev, topConcern: option.id }))}
                            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Current supplements or medications (optional)
                  </label>
                  <Input
                    placeholder="e.g. fish oil, glucosamine, gabapentin"
                    value={state.supplementsOrMeds}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, supplementsOrMeds: event.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-0 text-sm text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => setStep(4)}
                  >
                    Skip this step
                  </Button>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={state.email}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll email your score and occasional LOY-002 updates. Unsubscribe anytime.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          className="min-h-11 w-full sm:w-auto"
          disabled={step === 1 || submitting}
          onClick={previousStep}
        >
          Back
        </Button>
        {step < TOTAL_STEPS ? (
          <Button
            className="min-h-12 w-full bg-accent text-accent-foreground hover:brightness-110 sm:w-auto"
            disabled={!canContinue}
            onClick={nextStep}
          >
            Next
          </Button>
        ) : (
          <Button
            className="min-h-12 w-full bg-accent text-accent-foreground hover:brightness-110 sm:w-auto"
            disabled={!canContinue || submitting}
            onClick={submitQuiz}
          >
            {submitting ? "Calculating..." : "Get My Score"}
          </Button>
        )}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

