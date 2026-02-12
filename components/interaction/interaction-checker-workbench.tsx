"use client";

import { useMemo, useState } from "react";
import { Dna, Plus, X } from "lucide-react";
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

type InteractionResult = {
  pair: [string, string];
  rating: "SAFE" | "CAUTION" | "AVOID";
  explanation: string;
};

const commonSuggestions = [
  "glucosamine",
  "fish oil",
  "CBD",
  "turmeric",
  "probiotics",
  "CoQ10",
  "SAMe",
  "milk thistle",
  "vitamin E",
  "MSM",
];

export function InteractionCheckerWorkbench({ pets }: { pets: PetOption[] }) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? "");
  const [supplementInput, setSupplementInput] = useState("");
  const [supplements, setSupplements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState<InteractionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const addSupplement = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    if (supplements.some((item) => item.toLowerCase() === normalized.toLowerCase())) return;
    setSupplements((prev) => [...prev, normalized]);
    setSupplementInput("");
  };

  const runCheck = async () => {
    if (!selectedPet || supplements.length < 2) {
      setError("Choose a pet and add at least two supplements.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setSummary("");
    setResults([]);

    try {
      const response = await fetch("/api/supplements/check-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPet.id,
          petBreed: selectedPet.breed,
          petAge: selectedPet.age,
          petWeight: selectedPet.weight,
          supplements,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to check interactions.");
      }

      setSummary(data.result?.summary ?? "Review complete.");
      setResults(Array.isArray(data.result?.interactions) ? data.result.interactions : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to check interactions right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Build your supplement stack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Pet profile</p>
            <Select value={selectedPetId} onValueChange={setSelectedPetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pet" />
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

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Supplements</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={supplementInput}
                onChange={(event) => setSupplementInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSupplement(supplementInput);
                  }
                }}
                placeholder="Add supplement, then press Enter"
              />
              <Button type="button" variant="outline" onClick={() => addSupplement(supplementInput)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {supplements.map((supplement) => (
                <button
                  key={supplement}
                  type="button"
                  onClick={() =>
                    setSupplements((prev) => prev.filter((item) => item !== supplement))
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  {supplement}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {commonSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSupplement(suggestion)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={runCheck}
            disabled={isLoading}
            className="hover:scale-[1.02] transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Dna className="mr-2 h-4 w-4 animate-pulse" />
                Checking interactions...
              </>
            ) : (
              "Check Interactions"
            )}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {summary ? (
        <Card className="rounded-2xl border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{summary}</CardContent>
        </Card>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-3">
          {results.map((item, index) => (
            <Card
              key={`${item.pair.join("-")}-${index}`}
              className={`rounded-2xl border-l-4 ${
                item.rating === "AVOID"
                  ? "border-l-red-500"
                  : item.rating === "CAUTION"
                  ? "border-l-amber-500"
                  : "border-l-emerald-500"
              }`}
            >
              <CardContent className="space-y-2 p-5">
                <p className="text-sm font-semibold text-foreground">
                  {item.pair[0]} + {item.pair[1]} ({item.rating})
                </p>
                <p className="text-sm text-muted-foreground">{item.explanation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
