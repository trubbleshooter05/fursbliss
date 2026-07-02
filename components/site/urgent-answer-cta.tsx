"use client";

import type { MouseEvent } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackUrgentCheckoutAndRedirect, trackMetaCustomEvent } from "@/lib/meta-events";
import { URGENT_ANSWER_PRICE_USD } from "@/lib/stripe-prices";

type UrgentAnswerCtaProps = {
  source: string;
  returnTo?: string;
  cancelTo?: string;
  variant?: "hero" | "card" | "inline" | "post-check";
  className?: string;
};

function buildCheckoutHref(source: string, returnTo: string, cancelTo: string) {
  const params = new URLSearchParams({
    product: "urgent",
    source,
    returnTo,
    cancelTo,
  });
  return `/api/stripe/checkout?${params.toString()}`;
}

export function UrgentAnswerCta({
  source,
  returnTo = "/triage?urgent=ready",
  cancelTo = "/check",
  variant = "card",
  className,
}: UrgentAnswerCtaProps) {
  const href = buildCheckoutHref(source, returnTo, cancelTo);

  const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void trackMetaCustomEvent("ClickedUrgentAnswer", { source });
    await trackUrgentCheckoutAndRedirect(href, { source });
  };

  if (variant === "hero") {
    return (
      <Button
        size="lg"
        className={className ?? "w-full bg-amber-500 text-slate-900 hover:bg-amber-400 sm:w-auto"}
        onClick={onClick}
      >
        ER now or wait till morning? — ${URGENT_ANSWER_PRICE_USD} one-time
      </Button>
    );
  }

  if (variant === "post-check") {
    return (
      <div className={className ?? "rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"}>
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Want a vet-informed answer on this?</h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            Get a detailed, vet-informed response to your dog&apos;s specific symptoms in minutes &mdash; $24, one-time, no subscription.
          </p>
          <Button className="min-h-11 w-full bg-amber-600 hover:bg-amber-700" onClick={onClick}>
            Get my urgent answer &mdash; ${URGENT_ANSWER_PRICE_USD}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <Button className={className ?? "min-h-11 w-full"} onClick={onClick}>
        Get urgent answer — ${URGENT_ANSWER_PRICE_USD} once
      </Button>
    );
  }

  return (
    <div className={className ?? "rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"}>
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
              Panicking right now?
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
              ER now, or can this wait until morning?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              One-time payment. No subscription. Get a calm, detailed triage answer for tonight —
              what to watch, what to tell the vet, and when to escalate.
            </p>
          </div>
          <Button className="min-h-11 w-full bg-amber-600 hover:bg-amber-700" onClick={onClick}>
            Get my urgent answer — ${URGENT_ANSWER_PRICE_USD} one-time
          </Button>
          <p className="text-xs text-muted-foreground">Not a diagnosis. Call ER for collapse, choking, or trouble breathing.</p>
        </div>
      </div>
    </div>
  );
}
