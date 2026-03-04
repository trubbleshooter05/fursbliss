"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { trackCheckoutAndRedirect, trackMetaCustomEvent } from "@/lib/meta-events";

type PetSummary = {
  id: string;
  name: string;
  age: number;
  breed: string;
  symptoms: string[];
};

type RecommendationSummary = {
  id: string;
  petId: string;
  createdAt: string;
  response: string;
  notes?: string | null;
};

type InsightsPanelProps = {
  pets: PetSummary[];
  recommendations: RecommendationSummary[];
  subscriptionStatus: string;
  defaultPetId?: string;
  trackingDaysByPet: Record<string, number>;
  monthlyFreeUsage: number;
};

export function InsightsPanel({
  pets,
  recommendations,
  subscriptionStatus,
  defaultPetId,
  trackingDaysByPet,
  monthlyFreeUsage,
}: InsightsPanelProps) {
  const { toast } = useToast();
  const [selectedPetId, setSelectedPetId] = useState(
    defaultPetId ?? pets[0]?.id ?? ""
  );
  const [history, setHistory] = useState(recommendations);
  const [isLoading, setIsLoading] = useState(false);
  const [latestRecommendation, setLatestRecommendation] = useState<
    string | null
  >(null);
  const [range, setRange] = useState("30");
  const [query, setQuery] = useState("");
  const [freeUsageCount, setFreeUsageCount] = useState(monthlyFreeUsage);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [limitResetAt, setLimitResetAt] = useState<string | null>(null);

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId),
    [pets, selectedPetId]
  );
  const selectedPetTrackingDays = selectedPet ? trackingDaysByPet[selectedPet.id] ?? 0 : 0;
  const isPremium = subscriptionStatus === "premium";
  const needsTrackingGate = !isPremium && selectedPetTrackingDays < 7;
  const hasFreeQuota = isPremium || freeUsageCount < 3;
  const trackingDaysRemaining = Math.max(0, 7 - selectedPetTrackingDays);
  const nextResetLabel = useMemo(() => {
    if (!limitResetAt) return null;
    return new Date(limitResetAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [limitResetAt]);

  const filteredHistory = history.filter((recommendation) => {
    if (recommendation.petId !== selectedPetId) return false;
    const days = Number(range);
    if (!Number.isNaN(days)) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (new Date(recommendation.createdAt) < cutoff) return false;
    }
    if (query) {
      const haystack = `${recommendation.response} ${recommendation.notes ?? ""}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const handleGenerate = async () => {
    if (!selectedPet) return;
    if (needsTrackingGate) {
      toast({
        title: "Keep tracking to unlock AI insights",
        description: `Track ${selectedPet.name}'s health for ${trackingDaysRemaining} more day${trackingDaysRemaining === 1 ? "" : "s"} to unlock recommendations.`,
      });
      return;
    }
    if (!isPremium && !hasFreeQuota) {
      setShowLimitPrompt(true);
      await trackMetaCustomEvent("HitFreeAILimit", { petName: selectedPet.name });
      return;
    }

    setIsLoading(true);
    setLatestRecommendation(null);

    const response = await fetch("/api/ai/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petId: selectedPet.id,
        age: selectedPet.age,
        breed: selectedPet.breed,
        symptoms: selectedPet.symptoms,
      }),
    });

    setIsLoading(false);

    if (!response.ok) {
      let errorMessage = "Please try again in a moment.";
      try {
        const errorData = await response.json();
        if (errorData?.code === "MONTHLY_LIMIT_REACHED") {
          setShowLimitPrompt(true);
          setLimitResetAt(errorData.nextResetAt ?? null);
          await trackMetaCustomEvent("HitFreeAILimit", { petName: selectedPet.name });
        } else if (typeof errorData?.message === "string") {
          errorMessage = errorData.message;
        }
      } catch {
        // no-op
      }
      toast({
        title: "Unable to generate recommendation",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    const data = await response.json();
    setLatestRecommendation(data.response);
    if (typeof data.nextResetAt === "string") {
      setLimitResetAt(data.nextResetAt);
    }
    if (!isPremium) {
      if (typeof data.monthlyCount === "number") {
        setFreeUsageCount(Math.min(3, data.monthlyCount));
      } else {
        setFreeUsageCount((current) => Math.min(3, current + 1));
      }
    }
    setHistory((prev) => [
      {
        id: `temp-${Date.now()}`,
        petId: selectedPet.id,
        createdAt: new Date().toISOString(),
        response: data.response,
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            AI Insights
          </h1>
          <p className="text-muted-foreground">
            Personalized supplement guidance powered by GPT-4.
          </p>
          <p className="text-xs text-muted-foreground">
            AI suggestions are educational and should be reviewed with your veterinarian.
          </p>
        </div>
        {!isPremium && <Badge variant="secondary">Free plan: 3 AI insights / month</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select pet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose a pet" />
            </SelectTrigger>
            <SelectContent>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPet && (
            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Breed</span>
                <span className="font-medium text-slate-900">
                  {selectedPet.breed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Age</span>
                <span className="font-medium text-slate-900">
                  {selectedPet.age} years
                </span>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  Symptoms
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPet.symptoms.length === 0 ? (
                    <Badge variant="outline">No symptoms listed</Badge>
                  ) : (
                    selectedPet.symptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary">
                        {symptom}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {!isPremium && needsTrackingGate && selectedPet && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm">
              <p className="font-medium text-emerald-900">
                Track {selectedPet.name}&apos;s health for {trackingDaysRemaining} more day
                {trackingDaysRemaining === 1 ? "" : "s"} to unlock your first AI insight
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((selectedPetTrackingDays / 7) * 100))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-emerald-800">
                Progress: {selectedPetTrackingDays}/7 days completed.
              </p>
              <p className="mt-1 text-xs text-emerald-900/80">
                We need at least 7 days of data to give meaningful, personalized recommendations for{" "}
                {selectedPet.name}.
              </p>
            </div>
          )}

          {!isPremium && !needsTrackingGate && selectedPet && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">
                You&apos;ve unlocked AI insights! You have {Math.max(0, 3 - freeUsageCount)} of 3 free recommendations remaining this month.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {freeUsageCount} of 3 free AI insights used this month.
              </p>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={isLoading || (!isPremium && needsTrackingGate)}>
            {isLoading ? "Generating..." : "Get AI Recommendations"}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
          {!isPremium && (
            <p className="text-xs text-muted-foreground">{freeUsageCount} of 3 free AI insights used this month.</p>
          )}
        </CardContent>
      </Card>

      {!isPremium && showLimitPrompt && selectedPet && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader>
            <CardTitle>You&apos;ve used all 3 free AI insights this month.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-950/90">
            <p>Premium members get unlimited recommendations for {selectedPet.name}.</p>
            <p>
              Your next free insights reset on{" "}
              {nextResetLabel ??
                new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={async () => {
                  const href = `/api/stripe/checkout?plan=monthly&source=hit-free-ai-limit&returnTo=${encodeURIComponent(
                    `/insights?petId=${selectedPet.id}&upgraded=true`
                  )}&cancelTo=${encodeURIComponent(`/insights?petId=${selectedPet.id}`)}`;
                  await trackCheckoutAndRedirect(href, {
                    source: "hit_free_ai_limit",
                    value: 9,
                    contentName: "FursBliss Premium Monthly",
                  });
                }}
              >
                Upgrade to Unlimited — $9/mo
              </Button>
              <Button variant="ghost" onClick={() => setShowLimitPrompt(false)}>
                I&apos;ll wait for next month
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Prefer yearly?{" "}
              <a
                className="underline"
                href={`/api/stripe/checkout?plan=yearly&source=hit-free-ai-limit-yearly&returnTo=${encodeURIComponent(
                  `/insights?petId=${selectedPet.id}&upgraded=true`
                )}&cancelTo=${encodeURIComponent(`/insights?petId=${selectedPet.id}`)}`}
                onClick={(event) => {
                  event.preventDefault();
                  const href = event.currentTarget.getAttribute("href");
                  if (!href) return;
                  void trackCheckoutAndRedirect(href, {
                    source: "hit_free_ai_limit_yearly",
                    value: 59,
                    contentName: "FursBliss Premium Yearly",
                  });
                }}
              >
                Save 45% with annual billing
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {latestRecommendation && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <CardTitle>Latest recommendation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {latestRecommendation}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recommendation history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              placeholder="Search recommendations..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="md:max-w-xs"
            />
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="md:w-44">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
              No recommendations yet. Generate your first AI insight above.
            </div>
          ) : (
            filteredHistory.map((recommendation) => (
              <div
                key={recommendation.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-muted-foreground"
              >
                <p className="text-xs text-slate-400">
                  {new Date(recommendation.createdAt).toLocaleString()}
                </p>
                <p className="mt-2 whitespace-pre-line">
                  {recommendation.response}
                </p>
                <div className="mt-3 space-y-2">
                  <Input
                    placeholder="Add notes..."
                    value={recommendation.notes ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setHistory((prev) =>
                        prev.map((item) =>
                          item.id === recommendation.id
                            ? { ...item, notes: value }
                            : item
                        )
                      );
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await fetch(`/api/ai/recommendations/${recommendation.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ notes: recommendation.notes ?? "" }),
                      });
                    }}
                  >
                    Save notes
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
