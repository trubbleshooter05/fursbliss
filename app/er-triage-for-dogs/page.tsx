import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can this replace a veterinarian diagnosis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The FursBliss ER triage assistant offers informational urgency guidance only and does not provide veterinary diagnosis or treatment.",
      },
    },
    {
      "@type": "Question",
      name: "What does the triage assistant tell me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It returns a safety-first urgency level such as emergency now, vet today, vet soon, or home monitoring with suggested next steps.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a premium version?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Premium unlocks detailed likely-category analysis, 24-hour monitoring checklist, home-care guidance, and a vet-prep checklist.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Dog ER Triage Assistant | Should You Go to the Vet ER? | FursBliss",
  description:
    "Use FursBliss's AI-assisted dog ER triage assistant to understand urgency before heading to emergency care. Safety-first guidance for pet owners.",
  alternates: {
    canonical: "/er-triage-for-dogs",
  },
  openGraph: {
    title: "Dog ER Triage Assistant | FursBliss",
    description:
      "Understand symptom urgency before heading to the pet ER with safety-first triage guidance.",
    url: "/er-triage-for-dogs",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dog ER Triage Assistant | FursBliss",
    description:
      "Understand symptom urgency before heading to the pet ER with safety-first triage guidance.",
    images: ["/og-default.jpg"],
  },
};

export default function ErTriageForDogsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
        />
        <section className="space-y-3 rounded-3xl border border-border bg-card px-6 py-8 md:px-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Pet emergency support
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            Dog ER Triage Assistant: Know When to Go Now
          </h1>
          <p className="text-muted-foreground">
            Not every symptom needs a costly ER trip, but some signs need immediate care. FursBliss helps
            dog owners review urgency with a structured, safety-first triage flow before they decide.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="min-h-11">
              <Link href="/signup?redirect=/triage">Try ER Triage in FursBliss</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/pricing?from=er-triage-landing">Unlock full Premium triage report</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">What you get free</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Urgency signal: emergency now, vet today, vet soon, or monitor</p>
              <p>• Safety-first reason for urgency level</p>
              <p>• Fast guidance when you need clarity quickly</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">What Premium adds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Likely issue categories to discuss with your vet</p>
              <p>• 24-hour monitoring checklist</p>
              <p>• Home-care steps and vet-prep checklist</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Important safety note</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            FursBliss is informational and does not provide veterinary diagnosis or treatment. If your dog
            looks distressed or symptoms escalate, seek emergency veterinary care immediately.
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
