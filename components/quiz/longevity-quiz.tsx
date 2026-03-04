"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trackMetaCustomEvent, trackMetaEvent, trackPurchaseCompleted } from "@/lib/meta-events";
import { ProgressBar } from "@/components/quiz/progress-bar";
import { BreedSelector } from "@/components/quiz/breed-selector";
import { AgeSizeCards } from "@/components/quiz/age-size-cards";
import { HealthConcerns } from "@/components/quiz/health-concerns";
import { QuizLoading } from "@/components/quiz/quiz-loading";
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
  userCount: number;
  checkoutSuccess?: boolean;
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
  dogName: string;
  breed: string;
  ageRange: "under_3" | "3_6" | "7_10" | "11_plus" | "";
  sizeRange: "small" | "medium" | "large" | "xl" | "";
  concerns: string[];
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

const AGE_TO_VALUE: Record<NonNullable<QuizState["ageRange"]>, number> = {
  under_3: 2,
  "3_6": 4.5,
  "7_10": 8.5,
  "11_plus": 12,
  "": 4.5,
};

const SIZE_TO_WEIGHT: Record<NonNullable<QuizState["sizeRange"]>, number> = {
  small: 15,
  medium: 37,
  large: 70,
  xl: 100,
  "": 37,
};

export function LongevityQuiz({
  breeds,
  isPremium,
  userCount,
  checkoutSuccess = false,
  initialResult,
}: LongevityQuizProps) {
  const [isPremiumUser, setIsPremiumUser] = useState(isPremium);
  const [screen, setScreen] = useState<0 | 1 | 2 | 3>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showIdentityDone, setShowIdentityDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
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
  const [purchaseTracked, setPurchaseTracked] = useState(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const [state, setState] = useState<QuizState>({
    dogName: initialResult?.dogName ?? "",
    breed: initialResult?.breed ?? "",
    ageRange: "",
    sizeRange: "",
    concerns: initialResult?.concern ? [initialResult.concern] : [],
    email: initialResult?.email ?? "",
  });
  const concernPayload = useMemo(() => {
    if (state.concerns.length === 0 || state.concerns.includes("none")) {
      return ["general_longevity"];
    }
    return state.concerns;
  }, [state.concerns]);

  const mappedAge = AGE_TO_VALUE[state.ageRange];
  const mappedWeight = SIZE_TO_WEIGHT[state.sizeRange];
  const dogName = state.dogName.trim() || "Your Dog";

  useEffect(() => {
    if (screen === 2) {
      void trackMetaCustomEvent("QuizScreen2");
    }
    if (screen === 3) {
      void trackMetaCustomEvent("QuizScreen3");
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== 1 || !state.dogName.trim() || !state.breed.trim()) return;
    if (autoAdvanceTimerRef.current) window.clearTimeout(autoAdvanceTimerRef.current);
    setShowIdentityDone(true);
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      if (typeof document !== "undefined") {
        (document.activeElement as HTMLElement | null)?.blur();
      }
      setDirection(1);
      setScreen(2);
      setShowIdentityDone(false);
    }, 400);
    return () => {
      if (autoAdvanceTimerRef.current) window.clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [screen, state.breed, state.dogName]);

  useEffect(() => {
    if (screen !== 2 || !state.ageRange || !state.sizeRange) return;
    if (autoAdvanceTimerRef.current) window.clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      setDirection(1);
      setScreen(3);
    }, 400);
    return () => {
      if (autoAdvanceTimerRef.current) window.clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [screen, state.ageRange, state.sizeRange]);

  const goBack = () => {
    if (autoAdvanceTimerRef.current) window.clearTimeout(autoAdvanceTimerRef.current);
    if (screen === 3) {
      setDirection(-1);
      setScreen(2);
      return;
    }
    if (screen === 2) {
      setDirection(-1);
      setScreen(1);
    }
  };

  const handleStart = () => {
    void trackMetaCustomEvent("QuizStarted");
    setDirection(1);
    setScreen(1);
  };

  const toggleConcern = (concern: string) => {
    setState((prev) => {
      if (concern === "none") {
        return { ...prev, concerns: ["none"] };
      }
      const withoutNone = prev.concerns.filter((item) => item !== "none");
      const exists = withoutNone.includes(concern);
      return {
        ...prev,
        concerns: exists
          ? withoutNone.filter((item) => item !== concern)
          : [...withoutNone, concern],
      };
    });
  };

  const submitQuiz = async () => {
    if (!state.breed || !state.dogName.trim() || !state.ageRange || !state.sizeRange) return;
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur();
    }

    setSubmitting(true);
    setLoadingScore(true);
    setError(null);

    try {
      const delay = new Promise((resolve) => setTimeout(resolve, 3000));
      const request = fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dogName,
          breed: state.breed,
          age: Math.round(mappedAge),
          weight: mappedWeight,
          concerns: concernPayload,
        }),
      });

      const [response] = await Promise.all([request, delay]);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to submit quiz.");
      }

      setResult({
        id: String(payload.id),
        score: Number(payload.score),
        dogName,
        breed: state.breed,
        age: Math.round(mappedAge),
        weight: mappedWeight,
        concern: concernPayload[0] ?? "general_longevity",
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit quiz.");
      setLoadingScore(false);
      setDirection(-1);
      setScreen(3);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!result || quizCompletedTracked) return;
    void trackMetaCustomEvent("QuizCompleted");
    setQuizCompletedTracked(true);
  }, [quizCompletedTracked, result]);

  useEffect(() => {
    if (!checkoutSuccess || purchaseTracked) return;
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const sessionId = params?.get("session_id") ?? undefined;
    void trackPurchaseCompleted({ source: "quiz_results", value: 9, eventIdBase: sessionId });
    setPurchaseTracked(true);
  }, [checkoutSuccess, purchaseTracked]);

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { credentials: "same-origin" });
        if (!response.ok) return;
        const session = await response.json();
        const premium = session?.user?.subscriptionStatus === "premium";
        if (!cancelled) {
          setIsPremiumUser(Boolean(premium));
        }
      } catch {
        // Keep server-provided premium default if session fetch fails.
      }
    };
    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

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
    const checkoutHref = `/api/stripe/checkout?plan=monthly&source=quiz-results&returnTo=${encodeURIComponent(
      `/quiz?resultId=${result.id}&upgraded=true&checkout=success`
    )}&cancelTo=${encodeURIComponent(`/quiz?resultId=${result.id}`)}`;
    const premiumHref = checkoutHref;
    const testimonials = [
      "\"The timeline and weekly score alerts helped me bring a much better update to my vet visit.\"",
      "\"I finally knew what to track daily instead of guessing if my dog was improving.\"",
      "\"The supplement guidance made our routine simpler and less stressful.\"",
    ];

    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="space-y-4">
            {checkoutSuccess ? (
              <p className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">
                Premium activated! Your full longevity plan is now unlocked.
              </p>
            ) : null}
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
              premiumUnlocked={isPremiumUser}
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
              premiumUnlocked={isPremiumUser}
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
              premiumUnlocked={isPremiumUser}
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
              premiumUnlocked={isPremiumUser}
              lockedItems={[
                "Breed-specific health risk timeline",
                `Optimal vet visit schedule for ${breed}`,
                "Exercise and nutrition guidelines by life stage",
              ]}
            />
          </div>
        </section>

        {!isPremiumUser ? (
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
    <AnimatePresence mode="wait">
      <motion.div
        key={loadingScore ? "loading" : `screen-${screen}`}
        initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-4"
      >
        {loadingScore ? (
          <QuizLoading dogName={dogName} />
        ) : null}

        {!loadingScore && screen === 0 ? (
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="space-y-3">
              <CardTitle className="font-display text-3xl tracking-[-0.02em] text-foreground md:text-4xl">
                How Ready Is Your Dog for the Longevity Revolution?
              </CardTitle>
              <p className="text-base text-muted-foreground">
                3 quick questions. Get your dog&apos;s personalized Longevity Readiness Score in 90 seconds.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleStart}
                className="min-h-12 w-full bg-accent text-base font-semibold text-accent-foreground hover:brightness-110"
              >
                Start Free Quiz →
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Takes 30 seconds • {userCount.toLocaleString()}+ dogs scored
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!loadingScore && screen >= 1 ? (
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="space-y-3">
              <ProgressBar
                step={screen}
                totalSteps={3}
                label={screen === 3 ? "Question 3 of 3" : `Question ${screen} of 3`}
              />
              <CardTitle className="font-display text-3xl tracking-[-0.02em] text-foreground">
                {screen === 1 ? "Tell us about your dog" : null}
                {screen === 2 ? "Quick health context" : null}
                {screen === 3 ? `Any concerns about ${dogName}?` : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {screen === 1 ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">Dog&apos;s name</label>
                    <Input
                      autoFocus
                      className="min-h-12 text-base"
                      placeholder="Your dog's name"
                      value={state.dogName}
                      onChange={(event) =>
                        setState((prev) => ({ ...prev, dogName: event.target.value }))
                      }
                    />
                    {state.dogName.trim().length > 0 ? (
                      <p className="text-sm font-medium text-primary">Next: choose breed below</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-semibold text-foreground">Breed</label>
                    <BreedSelector
                      breeds={breeds}
                      selectedBreed={state.breed}
                      onSelect={(breed) => setState((prev) => ({ ...prev, breed }))}
                    />
                  </div>
                  {showIdentityDone ? (
                    <p className="text-sm font-medium text-emerald-700">✅ Great, let&apos;s personalize.</p>
                  ) : null}
                </div>
              ) : null}

              {screen === 2 ? (
                <AgeSizeCards
                  dogName={dogName}
                  ageValue={state.ageRange}
                  sizeValue={state.sizeRange}
                  onSelectAge={(value) =>
                    setState((prev) => ({
                      ...prev,
                      ageRange: value as QuizState["ageRange"],
                    }))
                  }
                  onSelectSize={(value) =>
                    setState((prev) => ({
                      ...prev,
                      sizeRange: value as QuizState["sizeRange"],
                    }))
                  }
                />
              ) : null}

              {screen === 3 ? (
                <HealthConcerns
                  dogName={dogName}
                  selected={state.concerns}
                  onToggle={toggleConcern}
                  onSubmit={submitQuiz}
                  submitting={submitting}
                />
              ) : null}

              {(screen === 2 || screen === 3) && !loadingScore ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 w-full"
                  onClick={goBack}
                  disabled={submitting}
                >
                  Back
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </motion.div>
    </AnimatePresence>
  );
}

