import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { symptomPages } from "@/lib/symptom-pages";

export const metadata: Metadata = {
  title: "Dog Symptom Guide | Free ER Triage Help | FursBliss",
  description:
    "Explore high-intent dog symptom guides and quickly decide if your dog needs emergency care, a vet visit, or home monitoring with our free triage tool.",
  alternates: { canonical: "/symptoms" },
};

export default function SymptomsHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <section className="space-y-3 rounded-3xl border border-border bg-card px-6 py-8 md:px-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Dog symptom guide</p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            Dog Symptom Guide: Know When to Go to the Vet
          </h1>
          <p className="text-muted-foreground">
            Fast, plain-English symptom pages for urgent dog health questions. Use these guides for quick
            context, then run the free triage tool for a personalized urgency recommendation.
          </p>
          <Button asChild className="h-auto min-h-12 whitespace-normal px-4 py-3 text-left leading-snug">
            <Link href="/triage">Get a personalized assessment → Free Dog Triage Tool</Link>
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {symptomPages.map((page) => (
            <Card key={page.slug} className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-xl leading-tight">
                  <Link href={`/symptoms/${page.slug}`} className="hover:text-primary">
                    {page.h1}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{page.quickAnswer}</p>
                <Button asChild variant="outline" className="min-h-11">
                  <Link href={`/symptoms/${page.slug}`}>Read guide</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
