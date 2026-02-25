"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackMetaCustomEvent } from "@/lib/meta-events";

type UpgradeCtaProps = {
  dogName: string;
  ctaHref: string;
  userCount: number;
  sectionId?: string;
};

const FEATURES = [
  "Daily health tracking dashboard",
  "AI-powered health trend alerts",
  "Personalized supplement recommendations",
  "LOY-002 readiness action plan",
  "Vet-ready health reports",
  "Breed-specific longevity insights",
];

export function UpgradeCta({ dogName, ctaHref, userCount, sectionId }: UpgradeCtaProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    if (!ref.current || viewTracked) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !viewTracked) {
          void trackMetaCustomEvent("ViewedPremiumOffer", { section: sectionId ?? "upgrade_cta" });
          setViewTracked(true);
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [sectionId, viewTracked]);

  return (
    <section
      id={sectionId}
      ref={ref}
      className="rounded-3xl border border-orange-200/70 bg-gradient-to-br from-[#2B134E] via-[#4A206D] to-[#D0643B] p-6 text-white shadow-[0_20px_60px_-30px_rgba(74,32,109,0.8)] md:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Premium plan</p>
      <h3 className="mt-2 font-display text-3xl tracking-[-0.03em] md:text-4xl">
        Unlock {dogName}&apos;s Complete Longevity Plan
      </h3>
      <p className="mt-2 text-sm text-white/90">
        Everything you need to give {dogName} the longest, healthiest life possible.
      </p>

      <div className="mt-5 grid gap-2">
        {FEATURES.map((feature) => (
          <p key={feature} className="flex items-center gap-2 text-sm text-white/95">
            <Check className="h-4 w-4" /> {feature}
          </p>
        ))}
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl bg-white/12 p-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/20 bg-white/10 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-white/75">Monthly</p>
          <p className="mt-1 text-2xl font-semibold">$9/month</p>
        </div>
        <div className="rounded-xl border border-white/35 bg-white/20 p-3">
          <p className="inline-flex rounded-full bg-amber-300 px-2 py-1 text-xs font-semibold text-slate-900">
            SAVE 45%
          </p>
          <p className="mt-2 text-3xl font-bold">$59/year</p>
          <p className="text-sm text-white/90">$4.92/month • Most Popular</p>
          <p className="mt-1 text-xs text-white/80">That&apos;s less than $0.17/day — less than a single dog treat 🐾</p>
        </div>
      </div>

      <div className="mt-5">
        <Button
          asChild
          className="min-h-12 w-full bg-white text-[#2B134E] hover:bg-white/90"
          onClick={() => void trackMetaCustomEvent("ClickedUpgrade", { source: sectionId ?? "upgrade_cta" })}
        >
          <a href={ctaHref}>Start {dogName}&apos;s Plan — Try Free for 7 Days</a>
        </Button>
        <p className="mt-2 text-center text-xs text-white/80">Cancel anytime. No questions asked.</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/85">
        <span>🔒 Secure checkout</span>
        <span>⭐ Rated 4.8/5 by dog parents</span>
        <span>🐕 Trusted by {userCount.toLocaleString()}+ dogs</span>
      </div>
    </section>
  );
}
