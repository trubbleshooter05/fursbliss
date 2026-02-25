"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trackMetaCustomEvent, trackMetaEvent } from "@/lib/meta-events";
import { ScoreGauge } from "@/components/quiz/score-gauge";
import { LongevityPlanCard } from "@/components/quiz/longevity-plan-card";
import { UpgradeCta } from "@/components/quiz/upgrade-cta";
import { FaqSection } from "@/components/quiz/faq-section";
import { StickyUpgradeBar } from "@/components/quiz/sticky-upgrade-bar";
import {
  getBreedLifespanRange,
  getBreedRiskCount,
  getBreedTrackingLift,
  getLoyEligibility,
  getScoreInterpretation,
  getSupplementCount,
} from "@/lib/quiz-results";

type LongevityQuizProps = {
  breeds: string[];
  isPremium: boolean;
  isSignedIn: boolean;
  userCount: number;
  initialResult?: {
    id: string;
    score: number;
    dogName: string;
    breed: string;
    age: number;
    weight: number;
    concern: string;
    email?: string;
  } | null;
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
  dogName: string;
  breed: string;
  age: number;
  weight: number;
  concern: string;
};

const CONCERN_OPTIONS: Array<{ id: string; label: string; payloadConcern: string }> = [
  { id: "longevity", label: "Longevity", payloadConcern: "general_longevity" },
  { id: "mobility", label: "Mobility", payloadConcern: "joint_mobility" },
  { id: "energy", label: "Energy", payloadConcern: "energy" },
  { id: "weight", label: "Weight", payloadConcern: "weight" },
  { id: "supplements", label: "Supplements", payloadConcern: "supplements" },
  { id: "loy-002", label: "LOY-002", payloadConcern: "loy002" },
];

export function LongevityQuiz({
  breeds,
  isPremium,
  isSignedIn,
  userCount,
  initialResult,
}: LongevityQuizProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(Boolean(initialResult?.email));
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(
    initialResult
      ? {
          id: initialResult.id,
          score: initialResult.score,
          dogName: initialResult.dogName,
          breed: initialResult.breed,
          age: initialResult.age,
          weight: initialResult.weight,
          concern: initialResult.concern,
        }
      : null
  );
  const [quizCompletedTracked, setQuizCompletedTracked] = useState(false);
  const [state, setState] = useState<QuizState>({
    breed: initialResult?.breed ?? "",
    age: initialResult?.age ?? 10,
    weight: initialResult?.weight ?? 40,
    topConcern: initialResult?.concern ?? "",
    supplementsOrMeds: "",
    email: initialResult?.email ?? "",
  });

  const TOTAL_STEPS = 3;
  const progress = (step / TOTAL_STEPS) * 100;
  const stepNameByNumber: Record<number, string> = {
    1: "breed_and_age",
    2: "weight_and_top_concern",
    3: "supplements_or_medications",
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
    return true;
  }, [state.age, state.breed, state.topConcern, state.weight, step]);

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

      setResult({
        id: String(payload.id),
        score: Number(payload.score),
        dogName: "Your Dog",
        breed: state.breed,
        age: state.age,
        weight: state.weight,
        concern: selectedConcern?.payloadConcern ?? "general_longevity",
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!result || quizCompletedTracked) return;
    void trackMetaCustomEvent("QuizCompleted");
    setQuizCompletedTracked(true);
  }, [quizCompletedTracked, result]);

  const submitEmailCapture = async () => {
    if (!result) return;
    const normalizedEmail = state.email.trim().toLowerCase();
    if (!normalizedEmail.includes("@") || normalizedEmail.length < 6) {
      setEmailError("Please enter a valid email.");
      return;
    }

    setEmailSubmitting(true);
    setEmailError(null);
    try {
      const response = await fetch("/api/quiz/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: result.id,
          email: normalizedEmail,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to save your email.");
      }

      await trackMetaEvent(
        "Lead",
        { content_name: "quiz_email_captured" },
        {
          eventId: typeof payload?.metaEventId === "string" ? payload.metaEventId : undefined,
        }
      );
      setEmailSubmitted(true);
      setState((prev) => ({ ...prev, email: normalizedEmail }));
    } catch (submitError) {
      setEmailError(submitError instanceof Error ? submitError.message : "Unable to save your email.");
    } finally {
      setEmailSubmitting(false);
    }
  };

  if (result) {
    const dogName = result.dogName || "Your Dog";
    const breed = result.breed;
    const interpretation = getScoreInterpretation(result.score, dogName);
    const trackingLift = getBreedTrackingLift(breed);
    const loyalty = getLoyEligibility(result.age, result.weight);
    const risks = getBreedRiskCount(breed);
    const supplements = getSupplementCount(result.age, result.concern);
    const lifespanRange = getBreedLifespanRange(breed, result.weight);
    const premiumHref = isSignedIn
      ? "/pricing?plan=yearly&from=quiz-results"
      : "/signup?plan=premium&trial=7&redirect=/dashboard&from=quiz-results";
    const testimonials = [
      "\"The timeline and weekly score alerts helped me bring a much better update to my vet visit.\"",
      "\"I finally knew what to track daily instead of guessing if my dog was improving.\"",
      "\"The supplement guidance made our routine simpler and less stressful.\"",
    ];

    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Your score is ready
            </p>
            <CardTitle className="font-display text-3xl text-foreground md:text-4xl">
              Your Dog&apos;s Longevity Readiness Score
            </CardTitle>
            <ScoreGauge score={result.score} dogName={dogName} />
            <p className="text-center text-lg font-semibold text-slate-900">
              {dogName}&apos;s Score: {result.score}/100
            </p>
            <p className="text-sm text-muted-foreground">{interpretation}</p>
            <p className="text-sm text-muted-foreground">
              Dogs like {breed} who track daily health signals score {trackingLift} points higher on average.
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-base font-semibold text-foreground">Get your full report emailed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll send your complete longevity report with personalized recommendations.
              </p>
              <div className="mt-3 space-y-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={state.email}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
                <Button
                  className="min-h-12 w-full bg-accent text-accent-foreground hover:brightness-110"
                  onClick={submitEmailCapture}
                  disabled={emailSubmitting || emailSubmitted}
                >
                  {emailSubmitted ? "Report Sent" : emailSubmitting ? "Sending..." : "Send My Report"}
                </Button>
                <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
                {emailSubmitted ? (
                  <p className="text-sm text-emerald-700">Check your inbox for your full report.</p>
                ) : null}
                {emailError ? <p className="text-sm text-destructive">{emailError}</p> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <section id="plan-section" className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Personalized plan</p>
            <h2 className="font-display text-3xl tracking-[-0.02em] text-foreground">
              {dogName}&apos;s Personalized Longevity Plan
            </h2>
            <p className="text-sm text-muted-foreground">
              Based on your quiz answers, here&apos;s what we recommend for {dogName}:
            </p>
          </div>

          <div className="grid gap-4">
            <LongevityPlanCard
              title="LOY-002 Readiness"
              summary={`LOY-002 eligibility: ${loyalty.status}`}
              freeLabel="Free"
              freeValue={`${dogName}'s breed (${breed}) is ${loyalty.breedStatus}.`}
              premiumUnlocked={isPremium}
              lockedItems={[
                "Your personalized LOY-002 action plan",
                `Estimated timeline for ${breed}`,
                "Vet talking points for your next appointment",
              ]}
            />
            <LongevityPlanCard
              title="Health Monitoring Dashboard"
              summary={`${dogName}'s breed has ${risks} common health risks to watch.`}
              freeLabel="Free"
              freeValue={`${risks} key risks identified for ${breed}.`}
              premiumUnlocked={isPremium}
              lockedItems={[
                "Track daily appetite, mobility, energy, and weight",
                "AI-powered health trend alerts",
                "Weekly health score updates",
                "Vet-ready health reports",
              ]}
            />
            <LongevityPlanCard
              title="Supplement Optimization"
              summary={`Based on ${dogName}'s age and breed, ${supplements} supplements may help.`}
              freeLabel="Free"
              freeValue={`${supplements} potential supplements flagged.`}
              premiumUnlocked={isPremium}
              lockedItems={[
                "Personalized supplement recommendations with dosages",
                "Interaction warnings for current medications",
                "Monthly optimization updates based on health data",
              ]}
            />
            <LongevityPlanCard
              title="Breed-Specific Longevity Insights"
              summary={`${breed} average lifespan: ${lifespanRange} years.`}
              freeLabel="Free"
              freeValue={`Baseline lifespan insight unlocked for ${breed}.`}
              premiumUnlocked={isPremium}
              lockedItems={[
                "Breed-specific health risk timeline",
                `Optimal vet visit schedule for ${breed}`,
                "Exercise and nutrition guidelines by life stage",
              ]}
            />
          </div>
        </section>

        {!isPremium ? (
          <>
            <UpgradeCta dogName={dogName} ctaHref={premiumHref} userCount={userCount} sectionId="upgrade-top" />

            <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h3 className="font-display text-3xl tracking-[-0.02em] text-foreground">
                What dog parents are saying
              </h3>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Example testimonials
              </p>
              <div className="mt-4 grid gap-3">
                {testimonials.map((quote) => (
                  <blockquote key={quote} className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground">
                    {quote}
                  </blockquote>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Join {userCount.toLocaleString()} dog parents already tracking their dog&apos;s longevity.
              </p>
            </section>

            <FaqSection />

            <UpgradeCta dogName={dogName} ctaHref={premiumHref} userCount={userCount} sectionId="upgrade-bottom" />
            <StickyUpgradeBar dogName={dogName} ctaHref={premiumHref} targetId="plan-section" />
          </>
        ) : (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <p className="text-sm font-semibold text-emerald-700">
              Premium unlocked. {dogName}&apos;s full plan is active in your account dashboard.
            </p>
          </section>
        )}
      </div>
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
                    onClick={submitQuiz}
                    disabled={submitting}
                  >
                    Skip this step
                  </Button>
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
            disabled={!canContinue || submitting}
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
            {submitting ? "Calculating..." : "Show My Score"}
          </Button>
        )}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

