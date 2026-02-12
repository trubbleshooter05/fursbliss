"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimateIn } from "@/components/ui/animate-in";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Daily tracking for one pet and the essentials.",
    features: [
      "1 pet profile",
      "Unlimited daily health logs",
      "3 AI recommendations per month",
      "Weight + gut health tracking",
    ],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$9",
    description: "Unlimited pets, unlimited AI, advanced longevity tools.",
    features: [
      "Unlimited pets + logs",
      "Unlimited AI recommendations",
      "Supplement interaction checker",
      "Vet-ready PDF reports",
      "Photo progress + reminders",
    ],
    cta: "Subscribe monthly",
    href: "/api/stripe/checkout?plan=monthly",
    highlight: true,
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const premiumPricing = useMemo(() => {
    if (billingPeriod === "yearly") {
      return {
        amount: "$79",
        suffix: "/ year",
        cta: "Subscribe yearly",
        href: "/api/stripe/checkout?plan=yearly",
      };
    }

    return {
      amount: "$9",
      suffix: "/ month",
      cta: "Subscribe monthly",
      href: "/api/stripe/checkout?plan=monthly",
    };
  }, [billingPeriod]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 space-y-8 sm:px-6 sm:py-16 sm:space-y-10">
        <AnimateIn className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Pricing
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
            Plans for every pet family
          </h1>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            Choose a plan that matches your pet wellness goals. Upgrade anytime.
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
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold sm:text-xs ${
                billingPeriod === "yearly"
                  ? "bg-accent text-accent-foreground animate-pulse"
                  : "bg-accent/20 text-accent-foreground"
              }`}
            >
              Save 27%
            </span>
          </div>
        </AnimateIn>

        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan, index) => (
            <AnimateIn key={plan.name} delay={index * 0.1}>
              <Card
                className={`relative h-full rounded-3xl border ${
                  plan.highlight
                    ? "border-accent bg-gradient-to-b from-white to-[var(--color-section-alt)] shadow-[0_14px_45px_-24px_rgba(232,168,56,0.65)]"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight ? (
                  <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-[0_0_24px_rgba(232,168,56,0.45)]">
                    Most Popular
                  </span>
                ) : null}
                <CardHeader className="space-y-3 p-5 sm:p-6">
                  <CardTitle className="font-display text-3xl text-foreground">{plan.name}</CardTitle>
                  {plan.highlight ? (
                    <div className="text-5xl font-semibold text-foreground">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={premiumPricing.amount}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="inline-block"
                        >
                          {premiumPricing.amount}
                        </motion.span>
                      </AnimatePresence>
                      <span className="ml-1 text-sm font-medium text-muted-foreground">
                        {premiumPricing.suffix}
                      </span>
                    </div>
                  ) : (
                    <p className="text-5xl font-semibold text-foreground">{plan.price}</p>
                  )}
                  {plan.highlight ? (
                    <p className="text-sm text-muted-foreground">$79 yearly (save 27%)</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-3">
                    <Button className="w-full hover:scale-[1.02] transition-all duration-300" asChild>
                      {plan.highlight ? (
                        <a href={premiumPricing.href}>{premiumPricing.cta}</a>
                      ) : plan.href.startsWith("/api/") ? (
                        <a href={plan.href}>{plan.cta}</a>
                      ) : (
                        <Link href={plan.href}>{plan.cta}</Link>
                      )}
                    </Button>
                    {plan.highlight ? (
                      <Button
                        className="w-full hover:scale-[1.02] transition-all duration-300"
                        variant="outline"
                        onClick={() =>
                          setBillingPeriod((prev) => (prev === "monthly" ? "yearly" : "monthly"))
                        }
                      >
                        Switch to {billingPeriod === "monthly" ? "yearly" : "monthly"}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
