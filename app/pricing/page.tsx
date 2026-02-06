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
    description: "Essential tracking for up to two pets.",
    features: [
      "Basic health tracking",
      "Limited weekly logs",
      "Basic AI suggestions",
      "Email support",
    ],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$9",
    description: "Advanced AI insights and unlimited tracking.",
    features: [
      "Unlimited pets + logs",
      "Advanced AI recommendations",
      "Exportable reports",
      "Priority support",
    ],
    cta: "Subscribe",
    href: "/api/stripe/checkout",
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
                <Button className="w-full" asChild>
                  {plan.href.startsWith("/api/") ? (
                    <a href={plan.href}>{plan.cta}</a>
                  ) : (
                    <Link href={plan.href}>{plan.cta}</Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
