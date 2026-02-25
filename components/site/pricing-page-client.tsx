"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimateIn } from "@/components/ui/animate-in";
import { trackMetaCustomEvent } from "@/lib/meta-events";

const comparisonRows = [
  { feature: "Daily health tracking dashboard", free: "Basic view", premium: "Full dashboard + history" },
  { feature: "AI-powered health trend alerts", free: "Not included", premium: "Included" },
  {
    feature: "Personalized supplement recommendations",
    free: "Basic suggestions",
    premium: "Personalized with dosages",
  },
  { feature: "LOY-002 readiness action plan", free: "Eligibility snapshot", premium: "Step-by-step action plan" },
  { feature: "Vet-ready health reports", free: "Preview only", premium: "Full export + sharing" },
  {
    feature: "Breed-specific longevity insights",
    free: "Lifespan range",
    premium: "Risk timeline + life-stage plan",
  },
];

type PricingPageClientProps = {
  initialPlan: "monthly" | "yearly";
  userCount: number;
};

export function PricingPageClient({ initialPlan, userCount }: PricingPageClientProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(initialPlan);

  useEffect(() => {
    void trackMetaCustomEvent("ViewedPricing");
  }, []);

  const premiumPricing = useMemo(() => {
    if (billingPeriod === "yearly") {
      return {
        planLabel: "yearly",
        cta: "Start your premium plan — Try Free for 7 Days",
        href: "/api/stripe/checkout?plan=yearly",
      };
    }

    return {
      planLabel: "monthly",
      cta: "Start your premium plan — Try Free for 7 Days",
      href: "/api/stripe/checkout?plan=monthly",
    };
  }, [billingPeriod]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:space-y-10 sm:px-6 sm:py-16">
        <AnimateIn className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
            Choose the plan that gives your dog a longer, healthier life
          </h1>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            Transparent pricing. No surprises. Upgrade when you are ready for personalized longevity guidance.
          </p>
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card p-1 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-full px-4 py-1 transition-all duration-300 ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`rounded-full px-4 py-1 transition-all duration-300 ${
                billingPeriod === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Yearly
            </button>
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground sm:text-xs">
              Save 45%
            </span>
          </div>
        </AnimateIn>

        <AnimateIn>
          <Card className="rounded-3xl border border-orange-200/70 bg-gradient-to-br from-[#2B134E] via-[#4A206D] to-[#D0643B] text-white shadow-[0_20px_60px_-30px_rgba(74,32,109,0.75)]">
            <CardHeader className="space-y-2 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">Most popular</p>
              <CardTitle className="font-display text-4xl tracking-[-0.03em]">Premium</CardTitle>
              <p className="text-sm text-white/85">Full longevity planning, alerts, and vet-ready reporting.</p>
            </CardHeader>
            <CardContent className="space-y-5 p-5 pt-0 sm:p-6 sm:pt-0">
              <div className="grid gap-3 rounded-2xl bg-white/12 p-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-white/80">Monthly</p>
                  <p className="mt-1 text-2xl font-semibold">$9/month</p>
                </div>
                <div className="rounded-xl border border-white/35 bg-white/20 p-3">
                  <p className="inline-flex rounded-full bg-amber-300 px-2 py-1 text-xs font-semibold text-slate-900">
                    SAVE 45%
                  </p>
                  <p className="mt-2 text-3xl font-bold">$59/year</p>
                  <p className="text-sm text-white/90">$4.92/month • Most Popular</p>
                  <p className="mt-1 text-xs text-white/80">
                    That&apos;s less than $0.17/day — less than a single dog treat 🐾
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                {comparisonRows.map((row) => (
                  <p key={row.feature} className="flex items-center gap-2 text-sm text-white/95">
                    <Check className="h-4 w-4" /> {row.feature}
                  </p>
                ))}
              </div>

              <Button
                asChild
                className="min-h-12 w-full bg-white text-[#2B134E] hover:bg-white/90"
                onClick={() => void trackMetaCustomEvent("ClickedUpgrade", { source: "pricing_page" })}
              >
                <a href={premiumPricing.href}>{premiumPricing.cta} ({premiumPricing.planLabel})</a>
              </Button>
              <p className="text-center text-xs text-white/80">Cancel anytime. No questions asked.</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/85">
                <span>🔒 Secure checkout</span>
                <span>⭐ Rated 4.8/5 by dog parents</span>
                <span>🐕 Trusted by {userCount.toLocaleString()}+ dogs</span>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn>
          <Card className="rounded-3xl border border-border bg-card">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="font-display text-3xl tracking-[-0.02em] text-foreground">
                Free vs Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-5 pt-0 sm:p-6 sm:pt-0">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Feature</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Free</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-border/70">
                      <td className="px-3 py-3 text-foreground">{row.feature}</td>
                      <td className="px-3 py-3 text-muted-foreground">{row.free}</td>
                      <td className="px-3 py-3 text-foreground">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </AnimateIn>

        <AnimateIn>
          <Card className="rounded-3xl border border-border bg-card">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="font-display text-2xl text-foreground">Need more time?</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              <p className="text-sm text-muted-foreground">
                Start free and upgrade when you&apos;re ready to unlock personalized plans and vet-ready reports.
              </p>
              <Button asChild variant="outline" className="mt-4 min-h-11">
                <Link href="/signup">Create free account</Link>
              </Button>
            </CardContent>
          </Card>
        </AnimateIn>
      </main>
      <SiteFooter />
    </div>
  );
}
