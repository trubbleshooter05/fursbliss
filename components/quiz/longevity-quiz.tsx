"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QUIZ_CONCERNS } from "@/lib/quiz";
import { trackMetaEvent } from "@/lib/meta-events";

type LongevityQuizProps = {
  breeds: string[];
};

type QuizState = {
  dogName: string;
  breed: string;
  age: number;
  weight: number;
  concerns: string[];
  email: string;
};

export function LongevityQuiz({ breeds }: LongevityQuizProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<QuizState>({
    dogName: "",
    breed: "",
    age: 10,
    weight: 40,
    concerns: [],
    email: "",
  });

  const progress = (step / 6) * 100;
  const filteredBreeds = useMemo(() => {
    if (!state.breed) return breeds.slice(0, 20);
    const query = state.breed.toLowerCase();
    return breeds.filter((breed) => breed.toLowerCase().includes(query)).slice(0, 20);
  }, [breeds, state.breed]);

  const canContinue = useMemo(() => {
    if (step === 1) return state.dogName.trim().length > 0;
    if (step === 2) return state.breed.trim().length > 0;
    if (step === 5) return state.concerns.length > 0;
    if (step === 6) return state.email.trim().length > 5;
    return true;
  }, [state.breed, state.concerns.length, state.dogName, state.email, step]);

  const nextStep = () => {
    if (!canContinue || step >= 6) return;
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
          dogName: state.dogName,
          breed: state.breed,
          age: state.age,
          weight: state.weight,
          concerns: state.concerns,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to submit quiz.");
      }

      await trackMetaEvent("Lead", { content_name: "quiz_email_captured" });
      await trackMetaEvent("CompleteRegistration", {
        content_name: "quiz_completed",
      });
      router.push(`/quiz/results/${payload.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
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
                {step === 1 && "What's your dog's name?"}
                {step === 2 && `What breed is ${state.dogName || "your dog"}?`}
                {step === 3 && `How old is ${state.dogName || "your dog"}?`}
                {step === 4 && `How much does ${state.dogName || "your dog"} weigh?`}
                {step === 5 && "What are you most concerned about?"}
                {step === 6 &&
                  `Enter your email to see ${state.dogName || "your dog's"} personalized longevity readiness score.`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 ? (
                <div className="space-y-3">
                  <label className="text-sm text-muted-foreground">Dog name</label>
                  <div className="relative">
                    <PawPrint className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Luna"
                      value={state.dogName}
                      onChange={(event) =>
                        setState((prev) => ({ ...prev, dogName: event.target.value }))
                      }
                    />
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Search breed..."
                    value={state.breed}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, breed: event.target.value }))
                    }
                  />
                  <div className="grid max-h-52 gap-2 overflow-y-auto rounded-xl border border-border p-2">
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
              ) : null}

              {step === 3 ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={state.age}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        age: Number(event.target.value || 1),
                      }))
                    }
                  />
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-3">
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
              ) : null}

              {step === 5 ? (
                <div className="grid gap-2">
                  {QUIZ_CONCERNS.map((concern) => {
                    const isSelected = state.concerns.includes(concern.key);
                    return (
                      <button
                        key={concern.key}
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            concerns: isSelected
                              ? prev.concerns.filter((value) => value !== concern.key)
                              : [...prev.concerns, concern.key],
                          }))
                        }
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {concern.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step === 6 ? (
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
                    We&apos;ll also send LOY-002 updates and senior dog health tips.
                    Unsubscribe anytime.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="min-h-11"
          disabled={step === 1 || submitting}
          onClick={previousStep}
        >
          Back
        </Button>
        {step < 6 ? (
          <Button className="min-h-11" disabled={!canContinue} onClick={nextStep}>
            Continue
          </Button>
        ) : (
          <Button className="min-h-11" disabled={!canContinue || submitting} onClick={submitQuiz}>
            {submitting ? "Calculating..." : "Get My Score"}
          </Button>
        )}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

