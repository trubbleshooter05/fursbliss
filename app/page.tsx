import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Droplets,
  LineChart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SocialCtaBanner } from "@/components/site/social-cta-banner";
import { AnimateIn } from "@/components/ui/animate-in";
import { PetTopicsWidget } from "@/components/PetTopicsWidget";
import { UrgentAnswerCta } from "@/components/site/urgent-answer-cta";
import { CheckSymptomsPromo } from "@/components/site/check-symptoms-promo";
import { getBlogPostsSortedByDateDesc } from "@/lib/content/blog-posts";
import { getSymptomPage } from "@/lib/emergency-symptoms/content";

const COMMON_EMERGENCY_SLUGS = [
  "vomiting-yellow-foam",
  "make-dog-throw-up",
  "ate-chocolate",
  "choking",
  "breathing-heavy",
] as const;

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
    quote: "The checker told us to go in — I’m glad we didn’t wait until morning.",
    owner: "Mixed breed owner",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Fast answers when something seems wrong — no credit card.",
    features: [
      "Instant symptom checker (60-second triage)",
      "Access to all emergency guides",
      "Clear \u2018go to vet now vs monitor\u2019 guidance",
    ],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$9",
    description: "Full history and reports for your vet, plus early access to new tools.",
    features: [
      "Downloadable vet-ready reports",
      "Full symptom + health history tracking",
      "Priority access to new tools",
    ],
    cta: "View pricing",
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

const publicPreviewItems = [
  {
    title: "60-second symptom checker",
    description:
      "Answer a few questions and get a simple band: emergency, vet soon, or monitor—plus text you can copy for your clinic.",
    href: "/check",
    cta: "Check Symptoms Now",
  },
  {
    title: "Browse dog emergency symptoms",
    description: "Search-style guides for vomiting, breathing changes, toxins, choking, and more.",
    href: "/symptoms",
    cta: "Open symptom hub",
  },
  {
    title: "LOY-002 FDA status (2026 update)",
    description:
      "See which regulatory sections are accepted, what’s still pending (manufacturing/CMC), and how to read timelines conservatively.",
    href: "/blog/loy-002-fda-status-2026",
    cta: "Read FDA status guide",
  },
  {
    title: "Run the 60-second quiz",
    description: "Get a real readiness score and recommendations before creating an account.",
    href: "/quiz",
    cta: "Open quiz",
  },
  {
    title: "Explore breed longevity pages",
    description: "See research-backed lifespan context and supplement guidance by breed.",
    href: "/breeds",
    cta: "Browse breeds",
  },
  {
    title: "Track LOY drug milestones",
    description: "Follow RXE, TAS, manufacturing, and approval progress in one place.",
    href: "/longevity-drugs",
    cta: "Open drug hub",
  },
  {
    title: "Use dog ER triage before urgent visits",
    description: "Get safety-first urgency guidance before deciding on emergency care.",
    href: "/er-triage-for-dogs",
    cta: "View ER triage guide",
  },
];

const loyaltyTimeline = [
  { label: "RXE", status: "done", detail: "Accepted" },
  { label: "TAS", status: "done", detail: "Accepted" },
  { label: "Manufacturing", status: "active", detail: "In review" },
  { label: "Approval", status: "pending", detail: "Pending" },
] as const;

export const metadata: Metadata = {
  title: "Dog Emergency Symptom Hub — Should I Take My Dog to the Vet? | FursBliss",
  description:
    "Fast, search-friendly guides and a 60-second symptom checker to help you decide if your dog needs emergency care, a vet visit soon, or close monitoring at home.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Dog Emergency Symptom Hub — Should I Take My Dog to the Vet? | FursBliss",
    description:
      "Fast, search-friendly guides and a 60-second symptom checker to help you decide if your dog needs emergency care, a vet visit soon, or close monitoring at home.",
    url: "/",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dog Emergency Symptom Hub — Should I Take My Dog to the Vet? | FursBliss",
    description:
      "Fast, search-friendly guides and a 60-second symptom checker to help you decide if your dog needs emergency care, a vet visit soon, or close monitoring at home.",
    images: ["/og-default.jpg"],
  },
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FursBliss",
  url: "https://www.fursbliss.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.fursbliss.com/breeds?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function Home() {
  const latestResearchPosts = getBlogPostsSortedByDateDesc().slice(0, 3);
  const commonEmergencyGuides = COMMON_EMERGENCY_SLUGS.map((slug) => getSymptomPage(slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SocialCtaBanner />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-8 pb-28 sm:px-6 md:gap-24 md:py-16 md:pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEBSITE_JSON_LD),
          }}
        />
        <section className="hero-gradient dot-grid-bg relative overflow-hidden rounded-[1.5rem] border border-white/15 px-4 py-10 text-white sm:px-6 sm:py-12 md:rounded-[2rem] md:px-10 md:py-14 lg:px-14">
          <Image
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1800&q=80"
            alt="Dog with owner"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2B2B]/95 via-[#0D6E6E]/84 to-[#14919B]/75" />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <AnimateIn className="space-y-6">
              <Badge className="border border-white/25 bg-white/10 text-white">
                <TriangleAlert className="mr-1 h-3.5 w-3.5" />
                Dog emergency symptom hub
              </Badge>
              <h1 className="max-w-3xl font-display text-[2rem] leading-[1.06] tracking-[-0.035em] text-white sm:text-4xl md:text-5xl">
                Should I take my dog to the vet right now?
              </h1>
              <p className="max-w-2xl text-base text-white/90 sm:text-lg">
                Get a quick recommendation based on your dog&apos;s symptoms, plus clear next steps in under 60 seconds.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  size="lg"
                  className="shimmer-cta min-h-12 w-full bg-accent px-6 text-base text-accent-foreground hover:scale-[1.02] hover:brightness-110 transition-all duration-300 sm:w-auto"
                  asChild
                >
                  <Link href="/check">
                    Free symptom check — 60 seconds
                    <ChevronRight className="ml-1 h-5 w-5" aria-hidden />
                  </Link>
                </Button>
                <UrgentAnswerCta source="home" variant="hero" className="w-full sm:w-auto" />
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/35 bg-white/5 text-white hover:scale-[1.02] hover:bg-white/10 transition-all duration-300 sm:w-auto"
                  asChild
                >
                  <Link href="/symptoms">Browse emergency guides</Link>
                </Button>
              </div>
              <p className="text-sm text-white/80">Free checker first — no account. Paid urgent answer only if you want a detailed triage write-up tonight.</p>
              <aside className="max-w-2xl rounded-2xl border border-white/20 bg-black/20 p-4 text-sm leading-relaxed text-white/90 backdrop-blur-sm">
                <strong className="text-white">Safety note:</strong> This tool is for informational support only and
                does not replace a veterinarian. If your dog is collapsing, choking, having trouble breathing,
                seizing, or you suspect poisoning, contact a veterinarian or emergency clinic immediately.
              </aside>
            </AnimateIn>

            <AnimateIn delay={0.1} className="grid gap-3">
              <CheckSymptomsPromo variant="hero" />
              <Link
                href="/symptoms/vomiting"
                className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                    <Droplets className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold text-white">Vomiting / diarrhea</p>
                    <p className="mt-1 text-sm text-white/80">GI upset, repeated episodes, and what “wait vs go” usually means.</p>
                    <p className="mt-2 text-sm font-medium text-white underline decoration-white/50 underline-offset-4 group-hover:decoration-white">
                      Open guide →
                    </p>
                  </div>
                </div>
              </Link>
              <Link
                href="/symptoms/breathing-heavy"
                className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                    <Wind className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold text-white">Breathing / panting</p>
                    <p className="mt-1 text-sm text-white/80">Heavy breathing, fast resting breaths, and overnight panting.</p>
                    <p className="mt-2 text-sm font-medium text-white underline decoration-white/50 underline-offset-4 group-hover:decoration-white">
                      Open guide →
                    </p>
                  </div>
                </div>
              </Link>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="font-display text-lg font-semibold text-white">Poisoning / choking</p>
                <p className="mt-1 text-sm text-white/80">Toxins like chocolate and true choking need different first steps.</p>
                <div className="mt-3 flex flex-col gap-2 text-sm font-medium">
                  <Link href="/symptoms/ate-chocolate" className="text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
                    Suspected poisoning (example: chocolate) →
                  </Link>
                  <Link href="/symptoms/choking" className="text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
                    Choking / airway emergency →
                  </Link>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        <AnimateIn>
          <CheckSymptomsPromo variant="banner" />
        </AnimateIn>

        <PetTopicsWidget />

        <AnimateIn>
          <section
            className="rounded-3xl border border-border bg-card px-6 py-8 md:px-8 md:py-10"
            aria-labelledby="common-emergencies-heading"
          >
            <h2
              id="common-emergencies-heading"
              className="font-display text-2xl tracking-tight text-foreground md:text-3xl"
            >
              Common Dog Emergencies
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-snug text-muted-foreground">
              High-intent guides with clear red flags and next steps. Each page links to related symptoms, the full hub,
              and the{" "}
              <Link href="/check" className="font-medium text-emerald-700 hover:underline">
                free checker
              </Link>
              .
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {commonEmergencyGuides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/symptoms/${g.slug}`}
                    className="block rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary"
                  >
                    {g.h1}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <CheckSymptomsPromo variant="compact" />
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

        <section className="space-y-8 rounded-3xl border border-border bg-card px-6 py-8 md:px-8">
          <AnimateIn className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Try before signup
            </p>
            <h2 className="text-3xl font-display text-foreground md:text-4xl">
              Experience core value without creating an account
            </h2>
            <p className="max-w-3xl text-muted-foreground">
              Start with the same public tools your ad traffic sees first, then create an account
              only when you want tracking and premium features.
            </p>
          </AnimateIn>
          <div className="grid gap-4 md:grid-cols-3">
            {publicPreviewItems.map((item, index) => (
              <AnimateIn key={item.title} delay={index * 0.08}>
                <Card className="h-full rounded-2xl border border-border bg-background/70">
                  <CardHeader className="space-y-2">
                    <CardTitle className="font-display text-2xl">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={item.href}>{item.cta}</Link>
                    </Button>
                  </CardContent>
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

        <AnimateIn>
          <section className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#2B134E] via-[#4A206D] to-[#D0643B] p-6 text-white md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Free Tool
                </p>
                <h2 className="font-display text-3xl tracking-[-0.03em] md:text-4xl">
                  How many walks do you have left?
                </h2>
                <p className="max-w-2xl text-sm text-white/90">
                  A beautiful emotional calculator that turns time together into walks, weekends,
                  sunsets, and moments you can share.
                </p>
              </div>
              <Button className="min-h-11 w-full bg-white text-[#2B134E] hover:bg-white/90 md:w-auto" asChild>
                <Link href="/walks-left">Try the free Walks Left tool</Link>
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
              <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  Next LOY-002 regulatory milestone may land this cycle.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Join now to get timeline alerts and be ready before demand spikes.
                </p>
                <p className="mt-3 text-sm">
                  <Link
                    href="/blog/loy-002-fda-status-2026"
                    className="font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-900"
                  >
                    LOY-002 FDA status (2026 update)
                  </Link>
                  <span className="text-muted-foreground"> — conservative, factual breakdown on the blog</span>
                </p>
              </div>
              <Button size="lg" className="bg-accent text-accent-foreground hover:scale-[1.02] transition-all duration-300" asChild>
                <Link href="/loy-002">Check Eligibility</Link>
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
              Free when you need triage now; Premium when you want everything documented for your vet.
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

        <section className="space-y-6">
          <AnimateIn className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Latest Research
            </p>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-3xl font-display text-foreground md:text-4xl">
                Fresh longevity updates for dog owners
              </h2>
              <Button variant="outline" asChild>
                <Link href="/blog">View all posts</Link>
              </Button>
            </div>
          </AnimateIn>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {latestResearchPosts.map((post, index) => (
              <AnimateIn key={post.slug} delay={index * 0.08}>
                <Card className="h-full rounded-2xl border border-border bg-card">
                  <CardHeader className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <CardTitle className="font-display text-2xl leading-tight">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  </CardHeader>
                </Card>
              </AnimateIn>
            ))}
          </div>
        </section>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-primary/30 bg-background/98 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Free · 60 sec · No login</p>
            <p className="text-sm font-medium text-foreground">
              Worried right now? Get ER now, vet today, or monitor — before you scroll away.
            </p>
          </div>
          <Button className="min-h-12 w-full bg-primary text-base shadow-md sm:w-auto" size="lg" asChild>
            <Link href="/check">
              Check symptoms now
              <ChevronRight className="ml-1 h-5 w-5" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
