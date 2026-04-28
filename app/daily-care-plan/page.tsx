import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Daily Dog Care Plan — Meds, Symptoms & Routines | FursBliss",
  description:
    "Build a daily dog care plan for medications, symptoms, meals, walks, and vet notes. FursBliss keeps the routine visible before small changes become bigger concerns.",
  alternates: { canonical: "/daily-care-plan" },
  openGraph: {
    title: "Daily Dog Care Plan | FursBliss",
    description:
      "Track medications, symptoms, meals, walks, and vet notes in one simple care rhythm.",
    url: "/daily-care-plan",
    type: "website",
    images: ["/og-default.jpg"],
  },
};

const checklist = [
  "Medication doses and missed-dose notes",
  "Appetite, water intake, stool, and energy changes",
  "Symptoms to watch after grooming, boarding, or new foods",
  "Vaccines, supplements, and follow-up reminders",
];

export default function DailyCarePlanPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Care routine</p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            A daily dog care plan that keeps small changes visible
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            FursBliss turns daily care into a simple timeline: meds, meals, symptoms, walks, and notes you can
            share before the next vet visit.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="min-h-12">
              <Link href="/signup">Start a care plan</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-12">
              <Link href="/vet-visit-prep">Prepare for a vet visit</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {checklist.map((item) => (
            <Card key={item} className="rounded-2xl border-border">
              <CardContent className="p-5 text-sm font-medium text-foreground">{item}</CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-3xl border border-primary/25 bg-primary/5 p-6 md:p-8">
          <h2 className="font-display text-2xl tracking-tight text-foreground">Built for the messy middle</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Not every change is an emergency. The useful habit is noticing patterns: two skipped meals, a cough
            after boarding, a limp that returns after long walks, or a medication dose that gets missed on busy
            mornings. A care plan gives those details a home.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
