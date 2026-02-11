import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
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
      "Log energy, appetite, mobility, and mood in a 30-second check-in.",
  },
  {
    icon: Sparkles,
    title: "AI supplement guidance",
    description:
      "Evidence-rated recommendations personalized to breed, age, and symptoms.",
  },
  {
    icon: LineChart,
    title: "Breed risk timelines",
    description:
      "See what health risks are common for your breed and when to watch for them.",
  },
  {
    icon: ShieldCheck,
    title: "Vet-ready reports",
    description:
      "Share health trends, supplements, and AI insights with your vet in one click.",
  },
];

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
    cta: "Get Started Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$9",
    description: "Unlimited pets, unlimited AI, advanced longevity tools.",
    features: [
      "Unlimited pets + AI",
      "Interaction checker",
      "Vet-shareable reports",
      "Photo progress + reminders",
    ],
    cta: "Upgrade to Premium",
    href: "/pricing",
    highlight: true,
  },
];

const howItWorks = [
  {
    title: "Add your dog",
    description:
      "Create a profile with breed, age, weight, and current symptoms in under two minutes.",
  },
  {
    title: "Track daily",
    description:
      "Log energy, appetite, mood, stool, weight, photos, and supplement adherence in one dashboard.",
  },
  {
    title: "Get AI longevity insights",
    description:
      "Receive evidence-rated recommendations and interaction checks you can share with your veterinarian.",
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 text-foreground">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
              Longevity intelligence for senior dogs
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              The longevity command center for your dog.
            </h1>
            <p className="text-lg text-muted-foreground">
              Track daily health signals, get AI-powered supplement guidance,
              and prepare for the first FDA-approved dog longevity drug.
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

        <section className="grid gap-6 rounded-3xl border border-slate-200/70 bg-white/90 p-8 md:grid-cols-3">
          <div>
            <p className="text-3xl font-semibold text-slate-900">1,300+</p>
            <p className="text-sm text-muted-foreground">
              Dogs enrolled in LOY-002 STAY study
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-slate-900">$150M+</p>
            <p className="text-sm text-muted-foreground">
              Loyal total funding reported
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-slate-900">70</p>
            <p className="text-sm text-muted-foreground">
              Clinics included in STAY enrollment
            </p>
          </div>
        </section>

        <section className="space-y-10" id="features">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
              Core Features
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Built for pet parents who want more healthy years
            </h2>
            <p className="text-muted-foreground">
              Daily tracking plus longevity-focused insights to help you act
              before small changes become big problems.
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

        <section className="grid gap-8 rounded-3xl border border-emerald-100 bg-emerald-50/60 px-8 py-12 shadow-lg shadow-emerald-500/10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
              Longevity drug readiness
            </Badge>
            <h2 className="text-3xl font-semibold text-slate-900">
              The first FDA dog longevity drug is coming.
            </h2>
            <p className="text-muted-foreground">
              Safety and efficacy have been accepted by FDA reviewers. One major
              step remains: manufacturing verification before conditional approval,
              which could arrive as early as 2026.
              FursBliss helps you track eligibility, readiness, and updates.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 text-sm text-muted-foreground">
              <p className="font-medium text-slate-900">LOY-002 eligibility</p>
              <p className="mt-2">
                Dog age 10+ and weight 14+ lbs. We&apos;ll notify you when
                availability changes so you can act as soon as LOY-002 is available.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/longevity-drugs">Check eligibility</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-8 rounded-3xl border border-slate-200/70 bg-white/90 px-8 py-12">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
              How it works
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Daily clarity in three simple steps
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <Card key={step.title} className="border border-slate-200/70">
                <CardHeader className="space-y-3">
                  <Badge className="w-fit bg-emerald-500/10 text-emerald-700">
                    Step {index + 1}
                  </Badge>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-emerald-100 bg-white/90 px-8 py-12 shadow-xl shadow-emerald-500/15 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
              Senior dog owners trust FursBliss
            </Badge>
            <h2 className="text-3xl font-semibold text-slate-900">
              Built for pet parents who want more healthy years.
            </h2>
            <p className="text-muted-foreground">
              Track daily signals, store photos, and get AI recommendations in
              one place. See improvements week over week and share reports with
              your vet in seconds.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-slate-900">AI Insight</p>
              <p className="mt-2">
                Based on Max&apos;s Golden Retriever profile and declining
                mobility, glucosamine HCl at 500mg shows high evidence for joint
                support in dogs over 10.
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
              Upgrade anytime to unlock unlimited AI, reports, and longevity
              tools.
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
                        / month or $79 yearly
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
