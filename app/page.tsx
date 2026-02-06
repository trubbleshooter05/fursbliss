import Link from "next/link";
import {
  LineChart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

const features = [
  {
    icon: Stethoscope,
    title: "Daily health tracking",
    description:
      "Capture energy, appetite, mood, and symptoms in a single streamlined workflow.",
  },
  {
    icon: Sparkles,
    title: "AI supplement guidance",
    description:
      "Get GPT-4 powered supplement suggestions based on age, breed, and symptoms.",
  },
  {
    icon: LineChart,
    title: "Trend analytics",
    description:
      "Visualize energy and weight trends to spot early changes and improvements.",
  },
  {
    icon: ShieldCheck,
    title: "Secure, private data",
    description:
      "Your pet's data is protected with modern authentication and encrypted storage.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started with core health tracking.",
    features: [
      "Up to 2 pets",
      "Weekly health logs",
      "Basic AI suggestions",
      "Email support",
    ],
    cta: "Get Started Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$9",
    description: "Unlock unlimited tracking and advanced insights.",
    features: [
      "Unlimited pets + logs",
      "Advanced AI recommendations",
      "Export health data",
      "Priority support",
    ],
    cta: "Upgrade to Premium",
    href: "/pricing",
    highlight: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 text-foreground">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
              AI-Powered Pet Wellness
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Track your pet&apos;s health, extend their life.
            </h1>
            <p className="text-lg text-muted-foreground">
              FursBliss helps modern pet parents log daily health signals,
              visualize trends, and unlock AI-driven supplement guidance to
              support longevity.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
          <Card className="border-none bg-white/90 shadow-2xl shadow-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                FursBliss Health Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">
                  Today&apos;s Wellness Score
                </p>
                <p className="mt-2 text-3xl font-semibold text-emerald-700">
                  8.6 / 10
                </p>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>Energy level</span>
                  <span className="font-medium text-slate-900">High</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>Appetite</span>
                  <span className="font-medium text-slate-900">Steady</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span>Mood</span>
                  <span className="font-medium text-slate-900">Calm</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-10">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
              Core Features
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Everything you need to run a pet wellness program
            </h2>
            <p className="text-muted-foreground">
              Give your pets the proactive care they deserve with daily tracking
              and evidence-backed recommendations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border border-slate-200/60 bg-white/90 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <feature.icon className="h-6 w-6" />
                  </span>
                  <CardTitle className="text-xl text-slate-900">
                    {feature.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-emerald-100 bg-white/90 px-8 py-12 shadow-xl shadow-emerald-500/15 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
              Trusted by modern pet parents
            </Badge>
            <h2 className="text-3xl font-semibold text-slate-900">
              Built for veterinarians, perfected for families.
            </h2>
            <p className="text-muted-foreground">
              Track medication schedules, store photos, and get instant AI
              recommendations in a single place. See improvements week over week
              and share reports with your vet in seconds.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-slate-900">AI Insight</p>
              <p className="mt-2">
                Based on today&apos;s symptoms, omega-3 and joint support can
                help reduce inflammation. Suggested dose: 1000mg daily.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-slate-900">Weekly trend</p>
              <p className="mt-2">
                Energy levels are up 12% compared to last week, indicating
                positive response to the new supplement plan.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-10" id="pricing">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
              Pricing
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Simple plans built for every pet family
            </h2>
            <p className="text-muted-foreground">
              Upgrade anytime to unlock unlimited tracking and advanced AI
              guidance.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative border ${
                  plan.highlight
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-slate-200/60 bg-white/90"
                } shadow-md`}
              >
                {plan.highlight && (
                  <span className="absolute right-6 top-6 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl text-slate-900">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-semibold text-slate-900">
                      {plan.price}
                    </span>
                    {plan.price !== "$0" && (
                      <span className="text-sm text-muted-foreground">
                        / month
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900 px-10 py-12 text-white">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">
                Ready to give your pet a longer, healthier life?
              </h2>
              <p className="text-white/70">
                Start free today and unlock AI-powered wellness insights in
                minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/pricing">Compare Plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
