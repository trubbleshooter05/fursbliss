"use client";

import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { trackUrgentCheckoutAndRedirect } from "@/lib/meta-events";

type Props = {
  dogName?: string;
  source?: string;
  className?: string;
};

function buildCheckoutHref(source: string) {
  const params = new URLSearchParams({
    product: "urgent",
    source,
    returnTo: "/triage?urgent=ready",
    cancelTo: "/check",
  });
  return `/api/stripe/checkout?${params.toString()}`;
}

export function SymptomUrgentUpsell({ dogName = "Your dog", source = "check-severity", className = "" }: Props) {
  const href = buildCheckoutHref(source);

  const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    await trackUrgentCheckoutAndRedirect(href, { source });
  };

  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm ${className}`}>
      <p className="text-sm leading-relaxed text-foreground/90">
        {dogName}&apos;s symptoms need a faster answer. Get a vet-reviewed response in under 2 hours — not tomorrow.
      </p>
      <Button className="mt-4 min-h-11 w-full bg-amber-600 hover:bg-amber-700" onClick={onClick}>
        Unlock Urgent Answer
      </Button>
    </div>
  );
}
