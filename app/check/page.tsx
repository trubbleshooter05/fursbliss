import type { Metadata } from "next";
import Link from "next/link";

import { EmergencyChecker } from "@/components/emergency-symptoms/emergency-checker";
import { MedicalDisclaimerBanner } from "@/components/emergency-symptoms/medical-disclaimer-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dog Symptom Checker — Emergency, Vet Soon, or Monitor | FursBliss",
  description:
    "Answer a few questions about your dog’s symptoms. Get a simple urgency suggestion: emergency, vet soon, or monitor—plus a copy-ready summary for your clinic.",
  alternates: { canonical: "/check" },
  openGraph: {
    title: "Dog symptom checker | FursBliss",
    description:
      "Fast triage-style questions—not a diagnosis. For emergencies, call a veterinarian or ER immediately.",
    url: "/check",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dog symptom checker | FursBliss",
    description:
      "Fast triage-style questions—not a diagnosis. For emergencies, call a veterinarian or ER immediately.",
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
            Dog symptom checker
          </h1>
          <p className="text-base leading-relaxed text-foreground/80">
            In under 60 seconds, you will arrive at three possible outcomes:{" "}
            <strong className="text-foreground">a vet emergency</strong>,{" "}
            <strong className="text-foreground">a possibility</strong>, or{" "}
            <strong className="text-foreground">monitoring symptoms</strong>. If your dog is collapsing, choking, struggling to
            breathe, seizuring, or may have been poisoned, skip this and call a vet or ER now.
          </p>
        </section>

        <EmergencyChecker />

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Vet-ready next step
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground">
            Turn your answers into a clinic-ready report
          </h2>
          <p className="mt-2 text-base leading-relaxed text-foreground/75">
            If you need to call a vet, the fastest help comes from clear details: symptoms,
            timing, appetite, bathroom changes, and what changed today. FursBliss Premium keeps
            that history organized so you can share it without scrambling.
          </p>
          <Button asChild className="mt-4 min-h-11 w-full">
            <Link href="/pricing?source=triage">Get the vet-ready report plan</Link>
          </Button>
        </section>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/symptoms" className="font-medium text-emerald-700 hover:underline">
            Browse all symptom guides
          </Link>
        </p>

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
