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
};

export function InsightsPanel({
  pets,
  recommendations,
  subscriptionStatus,
  defaultPetId,
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

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId),
    [pets, selectedPetId]
  );

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
      toast({
        title: "Unable to generate recommendation",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    const data = await response.json();
    setLatestRecommendation(data.response);
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
        </div>
        {subscriptionStatus !== "premium" && (
          <Badge variant="secondary">Premium feature</Badge>
        )}
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
          <Button
            onClick={handleGenerate}
            disabled={subscriptionStatus !== "premium" || isLoading}
          >
            {isLoading ? "Generating..." : "Get AI Recommendations"}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
          {subscriptionStatus !== "premium" && (
            <p className="text-sm text-muted-foreground">
              Upgrade to premium to unlock unlimited AI recommendations.
            </p>
          )}
        </CardContent>
      </Card>

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
