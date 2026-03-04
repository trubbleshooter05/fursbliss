"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

type BreedSelectorProps = {
  breeds: string[];
  selectedBreed: string;
  onSelect: (breed: string) => void;
};

const POPULAR_BREEDS = [
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd",
  "Bulldog",
  "Beagle",
  "Poodle",
  "Rottweiler",
  "Dachshund",
] as const;

export function BreedSelector({ breeds, selectedBreed, onSelect }: BreedSelectorProps) {
  const [useSearch, setUseSearch] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return breeds.slice(0, 12);
    return breeds.filter((breed) => breed.toLowerCase().includes(normalized)).slice(0, 16);
  }, [breeds, query]);

  return (
    <div className="space-y-3">
      {!useSearch ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {POPULAR_BREEDS.map((breed) => {
            const selected = selectedBreed === breed;
            return (
              <button
                key={breed}
                type="button"
                onClick={() => onSelect(breed)}
                className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-medium transition duration-200 ${
                  selected
                    ? "scale-[1.02] border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:border-primary/60"
                }`}
              >
                <span className="mr-1">🐕</span>
                {breed.replace(" Retriever", "")}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setUseSearch(true)}
            className="min-h-12 rounded-xl border border-border bg-background px-3 py-3 text-sm font-medium transition duration-200 hover:border-primary/60 md:col-span-2"
          >
            Other / Mixed
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Search breed"
            value={query}
            inputMode="search"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-12 text-base"
          />
          <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
            {filtered.map((breed) => (
              <button
                key={breed}
                type="button"
                onClick={() => onSelect(breed)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedBreed === breed
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                {breed}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setUseSearch(false);
              setQuery("");
            }}
          >
            Back to popular breeds
          </button>
        </div>
      )}
    </div>
  );
}
