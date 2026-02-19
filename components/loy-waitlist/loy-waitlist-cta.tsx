"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function LoyWaitlistCta() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [breed, setBreed] = useState("");
  const [hasChecked, setHasChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const eligibility = useMemo(() => {
    const ageNumber = toNumber(age);
    const weightNumber = toNumber(weight);
    const ageOk = ageNumber !== null && ageNumber >= 10;
    const weightOk = weightNumber !== null && weightNumber >= 14;
    return {
      ageNumber,
      weightNumber,
      isEligible: ageOk && weightOk,
    };
  }, [age, weight]);

  const onEligibilitySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasChecked(true);
  };

  const onWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/waitlist/loy002", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "loy002",
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "Unable to join the waitlist right now.");
      }

      const params = new URLSearchParams({
        fromWaitlist: "1",
        email,
        note: "while-you-wait-check-readiness",
      });
      if (breed.trim()) {
        params.set("breedHint", breed.trim());
      }
      router.push(`/quiz?${params.toString()}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to join the waitlist right now."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={onEligibilitySubmit} className="grid gap-3 md:grid-cols-4">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Dog age (years)"
          value={age}
          onChange={(event) => setAge(event.target.value)}
          required
        />
        <Input
          type="number"
          inputMode="decimal"
          min={1}
          placeholder="Weight (lbs)"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          required
        />
        <Input
          placeholder="Breed"
          value={breed}
          onChange={(event) => setBreed(event.target.value)}
          required
        />
        <Button type="submit" className="min-h-11 w-full">
          Check eligibility
        </Button>
      </form>

      {hasChecked ? (
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
          {eligibility.isEligible ? (
            <p className="font-medium text-emerald-700">
              Your dog may be eligible for LOY-002. Join the readiness list below.
            </p>
          ) : (
            <p className="text-muted-foreground">
              LOY-002 is currently being studied for dogs 10+ years and 14+ lbs -
              but longevity tracking benefits dogs of all ages. Join the readiness
              list below.
            </p>
          )}
        </div>
      ) : null}

      <form onSubmit={onWaitlistSubmit} className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Join the LOY-002 Readiness List
        </p>
        <p className="mt-2 text-sm text-slate-700">
          While you wait for LOY-002, check your dog&apos;s Longevity Readiness
          Score.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            inputMode="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" disabled={isSubmitting} className="min-h-11 sm:min-w-56">
            {isSubmitting ? "Joining..." : "Join the LOY-002 Readiness List"}
          </Button>
        </div>
        {submitError ? (
          <p className="mt-2 text-xs text-red-600">{submitError}</p>
        ) : null}
      </form>
    </div>
  );
}
