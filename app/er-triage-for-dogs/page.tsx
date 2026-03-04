import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const symptomChips = [
  { label: "My dog is vomiting", param: "vomiting" },
  { label: "My dog ate something toxic", param: "ate-something-toxic" },
  { label: "My dog is limping", param: "limping" },
  { label: "My dog won't eat", param: "wont-eat" },
  { label: "My dog is breathing hard", param: "breathing-hard" },
  { label: "My dog has diarrhea", param: "diarrhea" },
];

export const metadata: Metadata = {
  title: "Dog ER Triage: Should You Go to the Emergency Vet? | Free Tool | FursBliss",
  description:
    "Free 60-second dog triage tool. Find out if your dog's symptoms need emergency care, a vet visit, or home monitoring. No login required.",
  alternates: {
    canonical: "/er-triage-for-dogs",
  },
  openGraph: {
    title: "Dog ER Triage: Should You Go to the Emergency Vet? | FursBliss",
    description:
      "Free 60-second dog triage tool. Find out if your dog's symptoms need emergency care, a vet visit, or home monitoring. No login required.",
    url: "/er-triage-for-dogs",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dog ER Triage: Should You Go to the Emergency Vet? | FursBliss",
    description:
      "Free 60-second dog triage tool. Find out if your dog's symptoms need emergency care, a vet visit, or home monitoring. No login required.",
    images: ["/og-default.jpg"],
  },
};

export default async function ErTriageForDogsPage() {
  let userCount: number | null = null;
  try {
    userCount = await prisma.user.count();
  } catch {
    userCount = null;
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this a real vet diagnosis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. This is an informational triage tool to help you decide urgency. Always follow up with your veterinarian.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to create an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The urgency assessment is completely free with no login. Premium members get additional detail including likely conditions and monitoring checklists.",
        },
      },
      {
        "@type": "Question",
        name: "How much does an ER vet visit cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Emergency vet visits average $800-$1,500. Many are unnecessary. Our triage tool helps you determine if you need to go now, can wait for your regular vet, or can safely monitor at home.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
          <p className="text-sm font-medium text-foreground">
            No login required • Takes 60 seconds
            {userCount ? ` • Used by ${userCount.toLocaleString()} dog parents` : ""}
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="min-h-12 text-base">
              <Link href="/triage">Start Free Triage Now →</Link>
            </Button>
            <div className="flex flex-wrap gap-2">
              {symptomChips.map((chip) => (
                <Button key={chip.param} asChild variant="outline" className="min-h-12 rounded-full px-4 text-sm">
                  <Link href={`/triage?symptom=${encodeURIComponent(chip.param)}`}>{chip.label}</Link>
                </Button>
              ))}
            </div>
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

        <section className="space-y-4 rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-display text-3xl tracking-[-0.02em] text-foreground">FAQ</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Is this a real vet diagnosis?</p>
              <p>
                No. This is an informational triage tool to help you decide urgency. Always follow up with
                your veterinarian.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Do I need to create an account?</p>
              <p>
                No. The urgency assessment is completely free with no login. Premium members get additional
                detail including likely conditions and monitoring checklists.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">How much does an ER vet visit cost?</p>
              <p>
                Emergency vet visits average $800-$1,500. Many are unnecessary. Our triage tool helps you
                determine if you need to go now, can wait for your regular vet, or can safely monitor at
                home.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
