import type { Metadata } from "next";
import Link from "next/link";

import { EmergencyChecker } from "@/components/emergency-symptoms/emergency-checker";
import { MedicalDisclaimerBanner } from "@/components/emergency-symptoms/medical-disclaimer-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { UrgentAnswerCta } from "@/components/site/urgent-answer-cta";

export const metadata: Metadata = {
  title: "Free Dog Symptom Checker Online — Emergency, Vet Soon, or Monitor | FursBliss",
  description:
    "Free online dog symptom checker in under 60 seconds. Vomiting, diarrhea, not eating, breathing trouble, or pain—get emergency vs vet-soon vs monitor guidance (not a diagnosis).",
  alternates: { canonical: "/check" },
  openGraph: {
    title: "Free Dog Symptom Checker Online | FursBliss",
    description:
      "Check dog symptoms online in 60 seconds—emergency, vet soon, or monitor. Not a diagnosis; call a vet for true emergencies.",
    url: "/check",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Dog Symptom Checker Online | FursBliss",
    description:
      "Check dog symptoms online in 60 seconds—emergency, vet soon, or monitor. Not a diagnosis; call a vet for true emergencies.",
    images: ["/og-default.jpg"],
  },
};

export default function CheckPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg space-y-6 px-4 py-10 sm:px-6 md:py-14">
        <MedicalDisclaimerBanner />

        <section className="space-y-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Free online dog symptom checker
          </h1>
          <p className="text-base leading-relaxed text-foreground/80">
            Use this canine symptoms checker in under 60 seconds. You will arrive at three possible outcomes:{" "}
            <strong className="text-foreground">a vet emergency</strong>,{" "}
            <strong className="text-foreground">a possibility</strong>, or{" "}
            <strong className="text-foreground">monitoring symptoms</strong>. If your dog is collapsing, choking, struggling to
            breathe, seizuring, or may have been poisoned, skip this and call a vet or ER now.
          </p>
        </section>

        <EmergencyChecker />

        <UrgentAnswerCta
          source="check"
          returnTo="/triage?urgent=ready"
          cancelTo="/check"
        />

        <section className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Want ongoing tracking?</p>
          <p className="mt-2 leading-relaxed">
            Premium keeps symptom history, alerts, and vet-ready reports organized — for when symptoms come back.
          </p>
          <Button asChild variant="outline" className="mt-4 min-h-11 w-full">
            <Link href="/pricing?source=check-secondary">View Premium plans</Link>
          </Button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">More free health tools</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/symptoms" className="font-medium text-emerald-700 hover:underline">
                Browse all dog symptom guides
              </Link>
            </li>
            <li>
              <Link href="/triage" className="font-medium text-emerald-700 hover:underline">
                Full ER triage assistant (AI-assisted)
              </Link>
            </li>
            <li>
              <Link href="/er-triage-for-dogs" className="font-medium text-emerald-700 hover:underline">
                When to go to the emergency vet
              </Link>
            </li>
            <li>
              <Link href="/vet-visit-prep" className="font-medium text-emerald-700 hover:underline">
                Vet visit prep checklist
              </Link>
            </li>
            <li>
              <Link href="/daily-care-plan" className="font-medium text-emerald-700 hover:underline">
                Daily care plan for senior dogs
              </Link>
            </li>
          </ul>
        </section>

        <div className="flex justify-center pb-6">
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/triage">Or use the full triage tool →</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
