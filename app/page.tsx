import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  CheckCircle2,
  ChevronRight,
  LineChart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AnimateIn } from "@/components/ui/animate-in";
import { CountUp } from "@/components/ui/count-up";
import { HeroDashboardMock } from "@/components/hero/hero-dashboard-mock";

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

const testimonials = [
  {
    quote: "I caught a mobility decline two weeks before my vet noticed.",
    owner: "Golden Retriever owner",
  },
  {
    quote: "The supplement checker saved me from a dangerous interaction.",
    owner: "Senior Lab owner",
  },
  {
    quote: "I'm finally prepared for when LOY-002 becomes available.",
    owner: "Mixed breed owner",
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

const loyaltyTimeline = [
  { label: "RXE", status: "done", detail: "Accepted" },
  { label: "TAS", status: "done", detail: "Accepted" },
  { label: "Manufacturing", status: "active", detail: "In review" },
  { label: "Approval", status: "pending", detail: "Pending" },
] as const;

export const metadata: Metadata = {
  title: "FursBliss | Dog Longevity Intelligence Platform",
  description:
    "Track daily health signals, get AI-powered supplement guidance, and prepare for LOY-002. The longevity command center for your dog.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-8 sm:px-6 md:gap-24 md:py-16">
        <section className="hero-gradient dot-grid-bg relative overflow-hidden rounded-[1.5rem] border border-white/15 px-4 py-10 text-white sm:px-6 sm:py-12 md:rounded-[2rem] md:px-10 md:py-14 lg:px-14">
          <Image
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1800&q=80"
            alt="Senior dog with owner"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2B2B]/95 via-[#0D6E6E]/84 to-[#14919B]/75" />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <AnimateIn className="space-y-6">
              <Badge className="border border-white/25 bg-white/10 text-white">
                Premium science meets warmth
              </Badge>
              <h1 className="max-w-3xl font-display text-[2rem] leading-[1.04] tracking-[-0.035em] text-white sm:text-4xl md:text-6xl">
                The longevity command center for your dog.
              </h1>
              <p className="max-w-2xl text-base text-white/80 sm:text-lg">
                Track health trends, surface supplement risks, and prepare confidently for LOY-002
                with a platform designed for people who love their dogs like family.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="shimmer-cta w-full bg-accent text-accent-foreground hover:scale-[1.02] hover:brightness-110 transition-all duration-300 sm:w-auto"
                  asChild
                >
                  <Link href="/signup">Get Started Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/35 bg-white/5 text-white hover:scale-[1.02] hover:bg-white/10 transition-all duration-300 sm:w-auto"
                  asChild
                >
                  <Link href="/quiz">Take the Free Longevity Quiz</Link>
                </Button>
              </div>
            </AnimateIn>

            <AnimateIn delay={0.12}>
              <HeroDashboardMock />
            </AnimateIn>
          </div>

          <AnimateIn delay={0.22} className="relative z-10 mt-8">
            <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/90 md:grid-cols-3">
              <p className="rounded-xl bg-white/5 px-3 py-2 text-center">🔬 Backed by FDA-reviewed research</p>
              <p className="rounded-xl bg-white/5 px-3 py-2 text-center">🐕 1,300+ dogs in clinical trials</p>
              <p className="rounded-xl bg-white/5 px-3 py-2 text-center">🆓 Free forever plan</p>
            </div>
          </AnimateIn>
        </section>

        <AnimateIn>
          <section className="grid gap-4 rounded-3xl bg-[var(--color-section-dark)] px-8 py-10 text-white md:grid-cols-3">
            <div className="text-center md:border-r md:border-white/15">
              <p className="stat-number text-4xl font-bold text-white md:text-5xl">
                <CountUp to={1300} suffix="+" />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
                Dogs enrolled in STAY
              </p>
            </div>
            <div className="text-center md:border-r md:border-white/15">
              <p className="stat-number text-4xl font-bold text-white md:text-5xl">
                <CountUp to={250} prefix="$" suffix="M+" />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
                Total funding raised
              </p>
            </div>
            <div className="text-center">
              <p className="stat-number text-4xl font-bold text-white md:text-5xl">
                <CountUp to={70} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
                Active trial clinics
              </p>
            </div>
          </section>
        </AnimateIn>

        <section className="space-y-10" id="features">
          <AnimateIn className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Core Features</p>
            <h2 className="text-4xl font-display text-foreground md:text-5xl">
              Built for pet parents who want more healthy years
            </h2>
            <p className="max-w-3xl text-muted-foreground">
              Daily tracking plus longevity-focused intelligence, designed to help you act earlier
              with confidence.
            </p>
          </AnimateIn>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <AnimateIn key={feature.title} delay={index * 0.1}>
                <Card className="rounded-2xl border border-border bg-card p-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader className="space-y-4 p-6 md:p-8">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </span>
                    <CardTitle className="font-display text-2xl text-foreground">
                      {feature.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardHeader>
                </Card>
              </AnimateIn>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <AnimateIn className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">What owners say</p>
            <h2 className="text-4xl font-display text-foreground md:text-5xl">Trust built through early wins</h2>
          </AnimateIn>
          <div className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {testimonials.map((testimonial, index) => (
              <AnimateIn key={testimonial.owner} delay={index * 0.1} className="min-w-[83%] snap-start md:min-w-0">
                <Card className="h-full rounded-2xl border border-border bg-card p-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="space-y-4 p-6">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/40" />
                    <p className="text-base italic text-foreground">"{testimonial.quote}"</p>
                    <p className="text-sm text-muted-foreground">{testimonial.owner}</p>
                  </CardContent>
                </Card>
              </AnimateIn>
            ))}
          </div>
        </section>

        <AnimateIn>
          <section className="rounded-3xl border border-accent/40 bg-accent/15 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Free Quiz
                </p>
                <h2 className="font-display text-3xl tracking-[-0.03em] text-foreground md:text-4xl">
                  How ready is your dog for the longevity revolution?
                </h2>
                <p className="text-muted-foreground">
                  Take the 60-second quiz and get a personalized longevity readiness score.
                </p>
              </div>
              <Button className="min-h-11 w-full md:w-auto" asChild>
                <Link href="/quiz">Take the Quiz</Link>
              </Button>
            </div>
          </section>
        </AnimateIn>

        <section id="how-it-works" className="space-y-8 rounded-3xl border border-border bg-card px-4 py-8 sm:px-6 sm:py-10 md:px-10">
          <AnimateIn className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="text-4xl font-display text-foreground md:text-5xl">Daily clarity in three simple steps</h2>
          </AnimateIn>
          <div className="relative grid gap-5 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-9 hidden h-px bg-border md:block" />
            {howItWorks.map((step, index) => (
              <AnimateIn key={step.title} delay={index * 0.1} className="relative">
                <Card className="h-full rounded-2xl border border-border bg-background/70 p-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <CardHeader className="space-y-3 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      {index + 1}
                    </div>
                    <CardTitle className="font-display text-2xl">{step.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardHeader>
                </Card>
              </AnimateIn>
            ))}
          </div>
        </section>

        <section className="section-molecule rounded-3xl bg-[var(--color-section-alt)] px-6 py-12 md:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <AnimateIn className="space-y-4">
              <Badge className="w-fit bg-primary/10 text-primary">Longevity drug readiness</Badge>
              <h2 className="text-4xl font-display text-foreground md:text-5xl">
                The first FDA dog longevity drug is coming.
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Safety and efficacy accepted. $250M+ in total funding secured. Loyal plans to
                submit the final manufacturing requirement this year - conditional approval could
                follow in late 2026 or early 2027.
              </p>
              <Button size="lg" className="bg-accent text-accent-foreground hover:scale-[1.02] transition-all duration-300" asChild>
                <Link href="/longevity-drugs">Check Eligibility</Link>
              </Button>
            </AnimateIn>

            <AnimateIn delay={0.1} className="rounded-2xl border border-border bg-white p-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                Milestone timeline
              </p>
              <div className="mb-5 flex items-center">
                {loyaltyTimeline.map((item, index) => (
                  <div key={item.label} className="flex flex-1 items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold ${
                        item.status === "done"
                          ? "border-[var(--color-positive)] bg-[var(--color-positive)] text-white"
                          : item.status === "active"
                            ? "border-[var(--color-caution)] bg-[var(--color-caution)] text-black"
                            : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {item.status === "done" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : item.status === "active" ? (
                        <TriangleAlert className="h-4 w-4" />
                      ) : (
                        <span>•</span>
                      )}
                    </div>
                    {index < loyaltyTimeline.length - 1 ? (
                      <div className="mx-2 h-1 flex-1 rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: index < 2 ? "100%" : index === 2 ? "45%" : "0%" }}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {loyaltyTimeline.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p>{item.detail}</p>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </section>

        <section id="pricing" className="space-y-10">
          <AnimateIn className="space-y-3 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Pricing</p>
            <h2 className="text-4xl font-display text-foreground md:text-5xl">Simple plans for every pet family</h2>
            <p className="text-muted-foreground">
              Start free and upgrade when you want unlimited AI and premium longevity tools.
            </p>
          </AnimateIn>
          <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
            {plans.map((plan, index) => (
              <AnimateIn key={plan.name} delay={index * 0.1}>
                <Card
                  className={`relative rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    plan.highlight
                      ? "scale-[1.02] border-accent bg-gradient-to-b from-white to-[var(--color-section-alt)]"
                      : "border-border bg-white"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-[0_0_24px_rgba(232,168,56,0.45)]">
                      Most Popular
                    </span>
                  ) : null}
                  <CardHeader className="space-y-3">
                    <CardTitle className="font-display text-3xl text-foreground">{plan.name}</CardTitle>
                    <div className="flex items-end gap-2">
                      <span className="stat-number text-5xl font-semibold">{plan.price}</span>
                      {plan.price !== "$0" ? <span className="text-sm text-muted-foreground">/ month</span> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full hover:scale-[1.02] transition-all duration-300 ${
                        plan.highlight ? "bg-primary text-primary-foreground" : ""
                      }`}
                      variant={plan.highlight ? "default" : "outline"}
                      asChild
                    >
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimateIn>
            ))}
          </div>
        </section>

        <AnimateIn>
          <section className="grid gap-6 overflow-hidden rounded-3xl border border-border bg-card p-6 md:grid-cols-2 md:p-8">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary">Science + compassion</Badge>
              <h2 className="text-3xl font-display md:text-4xl">Built for people who love their dogs deeply.</h2>
              <p className="text-muted-foreground">
                Structured data, veterinary context, and clearer next actions for each season of senior
                dog health.
              </p>
              <Button asChild className="hover:scale-[1.02] transition-all duration-300">
                <Link href="/signup">
                  Start free today
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Image
                src="https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=900&q=80"
                alt="Senior golden retriever close-up"
                width={420}
                height={260}
                className="h-40 w-full rounded-2xl object-cover"
              />
              <Image
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80"
                alt="Owner holding dog"
                width={420}
                height={260}
                className="h-40 w-full rounded-2xl object-cover"
              />
              <Image
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80"
                alt="Dog at veterinary clinic"
                width={420}
                height={260}
                className="h-40 w-full rounded-2xl object-cover"
              />
              <Image
                src="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=900&q=80"
                alt="Happy senior dog running"
                width={420}
                height={260}
                className="h-40 w-full rounded-2xl object-cover"
              />
            </div>
          </section>
        </AnimateIn>
      </main>
      <SiteFooter />
    </div>
  );
}
