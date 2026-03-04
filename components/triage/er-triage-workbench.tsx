"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { AlertTriangle, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BREED_NAMES } from "@/lib/breed-data";
import { trackCheckoutAndRedirect, trackMetaCustomEvent, trackPurchaseCompleted } from "@/lib/meta-events";

type PetOption = {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
};

type TriageWorkbenchProps = {
  pets: PetOption[];
  initialSymptom?: string;
  checkoutSuccess?: boolean;
};

type TriageResponse = {
  urgency?: {
    urgencyLevel: "EMERGENCY_NOW" | "VET_TODAY" | "VET_SOON" | "HOME_MONITOR";
    urgencyReason: string;
    freeWhy?: string;
    freeNextSteps?: string[];
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

type TriageRequestPayload = {
  petId?: string;
  petName: string;
  petBreed: string;
  petAge: number;
  petWeight: number;
  symptoms: string;
  duration: string;
  behaviorChanges: string;
  eatingDrinking: string;
  bathroomChanges: string;
  emergencyFlags: string[];
};

const TRIAGE_LAST_INPUT_KEY = "triage:last-input";

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

const quickSymptomOptions = [
  "Vomiting",
  "Ate something toxic",
  "Limping",
  "Won't eat",
  "Breathing hard",
  "Diarrhea",
];

const durationOptions = [
  "Less than 1 hour",
  "1-6 hours",
  "6-24 hours",
  "1-3 days",
  "More than 3 days",
];

function urgencyTheme(level?: string) {
  if (level === "EMERGENCY_NOW") {
    return {
      badge: "🔴 EMERGENCY",
      heading: "Go to the ER now",
      cardClass: "border-rose-300 bg-rose-50 text-rose-900",
    };
  }
  if (level === "VET_TODAY") {
    return {
      badge: "🟠 VET TODAY",
      heading: "See your vet within 24 hours",
      cardClass: "border-orange-300 bg-orange-50 text-orange-900",
    };
  }
  if (level === "VET_SOON") {
    return {
      badge: "🟡 VET SOON",
      heading: "Schedule a vet visit this week",
      cardClass: "border-yellow-300 bg-yellow-50 text-yellow-900",
    };
  }
  return {
    badge: "🟢 MONITOR",
    heading: "Safe to monitor at home",
    cardClass: "border-emerald-300 bg-emerald-50 text-emerald-900",
  };
}

export function ErTriageWorkbench({
  pets,
  initialSymptom,
  checkoutSuccess: checkoutSuccessProp = false,
}: TriageWorkbenchProps) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? "");
  const [guestPetName, setGuestPetName] = useState("");
  const [guestPetBreed, setGuestPetBreed] = useState("");
  const [guestPetAge, setGuestPetAge] = useState("");
  const [guestPetWeight, setGuestPetWeight] = useState("");
  const [symptoms, setSymptoms] = useState(initialSymptom ? `${initialSymptom} ` : "");
  const [duration, setDuration] = useState("1-6 hours");
  const [behaviorChanges, setBehaviorChanges] = useState("");
  const [eatingDrinking, setEatingDrinking] = useState("");
  const [bathroomChanges, setBathroomChanges] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [checkoutSuccess, setCheckoutSuccess] = useState(checkoutSuccessProp);

  const startTrackedRef = useRef(false);
  const completeTrackedRef = useRef(false);
  const viewedPremiumTrackedRef = useRef(false);
  const completedPurchaseTrackedRef = useRef(false);
  const restoredAfterUpgradeRef = useRef(false);
  const premiumCardRef = useRef<HTMLDivElement | null>(null);
  const hasPets = pets.length > 0;

  const selectedPet = useMemo(() => pets.find((pet) => pet.id === selectedPetId) ?? null, [pets, selectedPetId]);
  const breedSuggestions = useMemo(() => {
    const query = guestPetBreed.trim().toLowerCase();
    if (query.length < 2) return [];
    return BREED_NAMES.filter((breed) => breed.toLowerCase().includes(query)).slice(0, 8);
  }, [guestPetBreed]);
  const symptomSnippet = useMemo(() => {
    const clean = symptoms.trim().replace(/\s+/g, " ");
    if (!clean) return "this symptom";
    return clean.length > 36 ? `${clean.slice(0, 36)}...` : clean;
  }, [symptoms]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setCheckoutSuccess(
      checkoutSuccessProp || params.get("checkout") === "success" || params.get("upgraded") === "true"
    );
  }, [checkoutSuccessProp]);

  useEffect(() => {
    if (!checkoutSuccess || completedPurchaseTrackedRef.current) return;
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const sessionId = params?.get("session_id") ?? undefined;
    void trackPurchaseCompleted({ source: "triage", value: 9, eventIdBase: sessionId });
    completedPurchaseTrackedRef.current = true;
  }, [checkoutSuccess]);

  useEffect(() => {
    if (!checkoutSuccess || restoredAfterUpgradeRef.current || loading || result?.detailed) return;
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(TRIAGE_LAST_INPUT_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as TriageRequestPayload;
      restoredAfterUpgradeRef.current = true;
      setGuestPetName(saved.petName);
      setGuestPetBreed(saved.petBreed);
      setGuestPetAge(String(saved.petAge));
      setGuestPetWeight(String(saved.petWeight));
      setSymptoms(saved.symptoms);
      setDuration(saved.duration);
      setBehaviorChanges(saved.behaviorChanges);
      setEatingDrinking(saved.eatingDrinking);
      setBathroomChanges(saved.bathroomChanges);
      setFlags(saved.emergencyFlags);

      void runTriage(saved);
    } catch {
      restoredAfterUpgradeRef.current = true;
    }
  }, [checkoutSuccess, loading, result?.detailed]);

  const buildTriagePayload = (): TriageRequestPayload => {
    const ageNumber = guestPetAge.trim() ? Number(guestPetAge) : 7;
    const weightNumber = guestPetWeight.trim() ? Number(guestPetWeight) : 45;
    const selectedPetName = selectedPet?.name?.trim();
    const selectedPetBreed = selectedPet?.breed?.trim();
    return {
      petId: selectedPet?.id,
      petName: selectedPetName || guestPetName.trim() || "Your dog",
      petBreed: selectedPetBreed || guestPetBreed.trim() || "Mixed breed",
      petAge: selectedPet?.age && Number.isFinite(selectedPet.age) ? selectedPet.age : ageNumber,
      petWeight:
        selectedPet?.weight && Number.isFinite(selectedPet.weight) ? selectedPet.weight : weightNumber,
      symptoms,
      duration,
      behaviorChanges,
      eatingDrinking,
      bathroomChanges,
      emergencyFlags: flags,
    };
  };

  const runTriage = async (payloadOverride?: TriageRequestPayload) => {
    const payload = payloadOverride ?? buildTriagePayload();

    if ((payload.symptoms ?? "").trim().length < 5) {
      setError("Please enter more symptom detail.");
      return;
    }

    if (!hasPets) {
      if (!payload.petName.trim() || !payload.petBreed.trim()) {
        setError("Add your dog's name and breed first.");
        return;
      }
      if (
        !Number.isFinite(payload.petAge) ||
        payload.petAge < 0 ||
        !Number.isFinite(payload.petWeight) ||
        payload.petWeight <= 0
      ) {
        setError("Enter valid age/weight numbers or leave them blank.");
        return;
      }
    } else if (!selectedPet && !payload.petId) {
      setError("Select a pet first.");
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(TRIAGE_LAST_INPUT_KEY, JSON.stringify(payload));
    }

    setError(null);
    setLoading(true);
    setResult(null);
    setEmailStatus("idle");
    completeTrackedRef.current = false;
    viewedPremiumTrackedRef.current = false;

    try {
      const response = await fetch("/api/ai/er-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const payloadResponse = (await response.json()) as TriageResponse & { message?: string };
      if (!response.ok) {
        throw new Error(payloadResponse.message ?? "Unable to run triage.");
      }
      setResult(payloadResponse);
    } catch (triageError) {
      setError(triageError instanceof Error ? triageError.message : "Unable to run triage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startTrackedRef.current) return;
    if (symptoms.trim().length > 0 || flags.length > 0) {
      void trackMetaCustomEvent("TriageStarted");
      startTrackedRef.current = true;
    }
  }, [symptoms, flags]);

  useEffect(() => {
    if (!result?.urgency || completeTrackedRef.current) return;
    void trackMetaCustomEvent("TriageCompleted", { urgency: result.urgency.urgencyLevel });
    completeTrackedRef.current = true;
  }, [result]);

  useEffect(() => {
    if (!result?.urgency || !result?.premiumRequired || viewedPremiumTrackedRef.current || !premiumCardRef.current) return;
    // Fire once when premium offer is on screen so Meta can build this custom event.
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !viewedPremiumTrackedRef.current) {
          void trackMetaCustomEvent("TriageViewedPremium");
          viewedPremiumTrackedRef.current = true;
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(premiumCardRef.current);
    return () => observer.disconnect();
  }, [result?.premiumRequired, result?.urgency]);

  useEffect(() => {
    if (!result?.urgency || !result?.premiumRequired || viewedPremiumTrackedRef.current || !premiumCardRef.current) return;
    const timer = window.setTimeout(() => {
      if (!premiumCardRef.current || viewedPremiumTrackedRef.current) return;
      const rect = premiumCardRef.current.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (inViewport) {
        void trackMetaCustomEvent("TriageViewedPremium");
        viewedPremiumTrackedRef.current = true;
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [result?.premiumRequired, result?.urgency]);

  const sendEmailReport = async () => {
    if (!result?.urgency) return;
    if (!email.includes("@")) {
      setEmailStatus("error");
      return;
    }
    setEmailStatus("sending");

    try {
      const response = await fetch("/api/triage/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          urgencyLevel: result.urgency.urgencyLevel,
          urgencyReason: result.urgency.urgencyReason,
          symptoms,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to capture email.");
      }
      void trackMetaCustomEvent("Lead", { source: "triage_email_capture" });
      setEmailStatus("sent");
    } catch {
      setEmailStatus("error");
    }
  };

  const theme = urgencyTheme(result?.urgency?.urgencyLevel);
  const checkoutHref = "/api/stripe/checkout?plan=monthly&source=triage&returnTo=%2Ftriage%3Fupgraded%3Dtrue%26checkout%3Dsuccess&cancelTo=%2Ftriage";
  const upgradeHref = checkoutHref;
  const shouldShowUpgrade = Boolean(result?.urgency && result?.premiumRequired);

  const handleUpgradeClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const href = event.currentTarget.getAttribute("href") || upgradeHref;
    void trackMetaCustomEvent("TriageClickedUpgrade", { destination: href });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TRIAGE_LAST_INPUT_KEY, JSON.stringify(buildTriagePayload()));
    }
    await trackCheckoutAndRedirect(href, {
      source: "triage_upgrade",
      value: 9,
      contentName: "FursBliss Premium Monthly",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Describe symptoms before heading to ER</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPets ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Pet profile</p>
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger className="min-h-12">
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
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                className="min-h-12 text-base"
                placeholder="Dog name"
                value={guestPetName}
                onChange={(event) => setGuestPetName(event.target.value)}
              />
              <Input
                className="min-h-12 text-base"
                placeholder="Breed"
                value={guestPetBreed}
                onChange={(event) => setGuestPetBreed(event.target.value)}
              />
              {breedSuggestions.length > 0 ? (
                <div className="-mt-1 md:col-span-2">
                  <div className="rounded-xl border border-border bg-background p-2">
                    <p className="px-2 pb-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Breed suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {breedSuggestions.map((breed) => (
                        <button
                          key={breed}
                          type="button"
                          className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition hover:border-primary"
                          onClick={() => setGuestPetBreed(breed)}
                        >
                          {breed}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              <Input
                className="min-h-12 text-base"
                placeholder="Age (years)"
                value={guestPetAge}
                onChange={(event) => setGuestPetAge(event.target.value)}
              />
              <Input
                className="min-h-12 text-base"
                placeholder="Weight (lbs)"
                value={guestPetWeight}
                onChange={(event) => setGuestPetWeight(event.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Quick symptom starters</p>
            <div className="flex flex-wrap gap-2">
              {quickSymptomOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setSymptoms((prev) => {
                      const template = `${item}. Started recently.`;
                      return prev.trim() ? `${prev.trim()} ${item}`.trim() : template;
                    })
                  }
                  className="min-h-12 rounded-full border border-border px-4 text-sm text-foreground transition hover:border-primary"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base"
            placeholder="Describe symptoms in detail..."
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="min-h-12">
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
              className="min-h-12 text-base"
              placeholder="Behavior changes (optional)"
              value={behaviorChanges}
              onChange={(event) => setBehaviorChanges(event.target.value)}
            />
            <Input
              className="min-h-12 text-base"
              placeholder="Eating/drinking changes (optional)"
              value={eatingDrinking}
              onChange={(event) => setEatingDrinking(event.target.value)}
            />
            <Input
              className="min-h-12 text-base"
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
                    className={`min-h-12 rounded-full border px-4 text-sm transition ${
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

          <Button onClick={() => void runTriage()} disabled={loading} className="min-h-12">
            {loading ? "Analyzing..." : "Run ER Triage"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {result?.urgency ? (
        <Card className={`rounded-2xl border-2 ${theme.cardClass}`}>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Triage result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkoutSuccess ? (
              <p className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">
                Premium activated! Here&apos;s your complete triage report.
              </p>
            ) : null}
            <span className="inline-flex rounded-full border border-current/20 bg-white/70 px-3 py-1 text-xs font-semibold">
              {theme.badge}
            </span>
            <p className="text-xl font-semibold">{theme.heading}</p>
            <p className="text-sm">{result.urgency.urgencyReason}</p>
            {result.urgency.freeWhy ? (
              <div className="rounded-lg border border-current/20 bg-white/60 p-3 text-sm">
                <p className="font-semibold">Why this result</p>
                <p className="mt-1">{result.urgency.freeWhy}</p>
              </div>
            ) : null}
            {result.urgency.freeNextSteps?.length ? (
              <div className="rounded-lg border border-current/20 bg-white/60 p-3 text-sm">
                <p className="font-semibold">What to do now</p>
                <div className="mt-1 space-y-1">
                  {result.urgency.freeNextSteps.slice(0, 2).map((step) => (
                    <p key={step}>• {step}</p>
                  ))}
                </div>
              </div>
            ) : null}
            {result.warning ? <p className="text-sm text-amber-800">{result.warning}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      {result?.urgency ? (
        <Card className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
          <CardHeader>
            <CardTitle className="font-display text-xl leading-tight text-foreground">
              Save This Baseline & Track Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We&apos;ll check back in 3 days to see if{" "}
              <span className="font-medium text-foreground">{symptomSnippet}</span> is improving or getting
              worse
            </p>
            <Button
              asChild
              className="min-h-12 w-full bg-blue-600 text-base font-semibold hover:bg-blue-700"
            >
              <Link href="/dashboard">Set My 3-Day Check-In</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              We&apos;ll send you a reminder email and track progress in your dashboard
            </p>
          </CardContent>
        </Card>
      ) : null}

      {result?.urgency ? (
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="text-xl">Get this triage report emailed to you (to share with your vet)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Input
              className="min-h-12"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button onClick={sendEmailReport} disabled={emailStatus === "sending"} className="min-h-12">
              {emailStatus === "sending" ? "Sending..." : "Send Report"}
            </Button>
            {emailStatus === "sent" ? <p className="text-sm text-emerald-700">Sent. Check your inbox.</p> : null}
            {emailStatus === "error" ? (
              <p className="text-sm text-destructive">Please enter a valid email and try again.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {shouldShowUpgrade ? (
        <Card ref={premiumCardRef} className="animate-pulse-border rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
          <CardHeader>
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-6 w-6 flex-shrink-0 text-amber-600" />
              <CardTitle className="font-display text-xl leading-tight text-foreground md:text-2xl">
                Don&apos;t let this happen again — know before it&apos;s an emergency
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2.5 rounded-xl border border-amber-200 bg-white/80 p-4 shadow-sm">
              {[
                {
                  emoji: "🔴",
                  text: "Red-flag alerts: what to watch for in the next 24-72 hours",
                },
                {
                  emoji: "⚠️",
                  text: "Early warning signs you might be missing right now",
                },
                {
                  emoji: "💰",
                  text: "Exactly what to tell your vet (saves $200+ in unnecessary tests)",
                },
                {
                  emoji: "🏠",
                  text: "Home care protocol for tonight",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="relative overflow-hidden rounded-lg border border-amber-200/70 bg-gradient-to-r from-amber-50/50 to-orange-50/30 px-3 py-2.5 shadow-sm"
                >
                  <p className="pr-8 text-sm font-medium text-foreground blur-[1.8px]">
                    {item.emoji} {item.text}
                  </p>
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-amber-700" />
                </div>
              ))}
            </div>
            <Button asChild className="min-h-12 w-full bg-amber-600 text-base font-semibold hover:bg-amber-700">
              <a href={upgradeHref} onClick={handleUpgradeClick}>
                Protect {selectedPet?.name || guestPetName || "Your Dog"} — $9/mo
              </a>
            </Button>
            <p className="text-center text-xs font-medium text-muted-foreground">
              Ongoing health alerts. Early warning detection. Vet-ready reports. Cancel anytime.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              <a
                className="font-medium underline hover:text-foreground"
                href={`/api/stripe/checkout?plan=yearly&source=triage-yearly&returnTo=${encodeURIComponent(
                  "/triage?upgraded=true&checkout=success"
                )}&cancelTo=${encodeURIComponent("/triage")}`}
                onClick={(event) => {
                  event.preventDefault();
                  const href = event.currentTarget.getAttribute("href");
                  if (!href) return;
                  void trackCheckoutAndRedirect(href, {
                    source: "triage_yearly",
                    value: 59,
                    contentName: "FursBliss Premium Yearly",
                  });
                }}
              >
                Prefer yearly? Save 45% with annual billing
              </a>
            </p>
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

      {result?.urgency ? (
        <Card className="rounded-2xl border-border bg-primary/5">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-foreground">
              While you&apos;re here: How ready is your dog for the new FDA longevity drug?
            </p>
            <Button asChild className="min-h-12">
              <Link href="/quiz">Take the 2-Min Longevity Quiz →</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl border-border bg-muted/30">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          This tool provides triage guidance only and is not a veterinary diagnosis. If your dog looks
          distressed, seek emergency care immediately.
        </CardContent>
      </Card>
    </div>
  );
}
