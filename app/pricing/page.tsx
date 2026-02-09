import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    yearlyCta: "Subscribe yearly",
    yearlyHref: "/api/stripe/checkout?plan=yearly",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Pricing
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Plans for every pet family
          </h1>
          <p className="text-muted-foreground">
            Choose a plan that matches your pet wellness goals. Upgrade anytime.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border ${
                plan.highlight
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-slate-200/60 bg-white"
              }`}
            >
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-slate-900">
                  {plan.name}
                </CardTitle>
                <p className="text-4xl font-semibold text-slate-900">
                  {plan.price}
                  {plan.price !== "$0" && (
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      / month
                    </span>
                  )}
                </p>
                {plan.price !== "$0" && (
                  <p className="text-sm text-muted-foreground">
                    $79 yearly (save 27%)
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="grid gap-3">
                  <Button className="w-full" asChild>
                    {plan.href.startsWith("/api/") ? (
                      <a href={plan.href}>{plan.cta}</a>
                    ) : (
                      <Link href={plan.href}>{plan.cta}</Link>
                    )}
                  </Button>
                  {"yearlyHref" in plan && plan.yearlyHref && (
                    <Button className="w-full" variant="outline" asChild>
                      <a href={plan.yearlyHref}>{plan.yearlyCta}</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
