import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSymptomsPromo } from "@/components/site/check-symptoms-promo";
import { getFeaturedEmergencySymptomPages, getOtherEmergencySymptomPages } from "@/lib/emergency-symptoms/content";
import { symptomPages } from "@/lib/symptom-pages";

export const metadata: Metadata = {
  title: "Dog Emergency Symptoms — Guides & Checker | FursBliss",
  description:
    "Plain-English guides for urgent dog health questions, internal links between related topics, and a free 60-second symptom checker with vet-ready summary text.",
  alternates: { canonical: "/symptoms" },
};

export default function SymptomsHubPage() {
  const featuredEmergency = getFeaturedEmergencySymptomPages();
  const otherEmergency = getOtherEmergencySymptomPages();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <section className="space-y-3 rounded-3xl border border-border bg-card px-6 py-8 md:px-8 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Dog emergency symptoms</p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            Dog emergency symptom hub
          </h1>
          <p className="text-muted-foreground">
            Short guides for high-intent questions like vomiting foam, chocolate ingestion, breathing changes, and
            “should I go to the vet?” Start with a guide for context, then use the same checklist for every page:{" "}
            <Link href="/check" className="font-medium text-emerald-700 hover:underline">
              Check Symptoms Now
            </Link>
            . If you follow longevity news for senior dogs, see our{" "}
            <Link href="/blog/loy-002-fda-status-2026" className="font-medium text-emerald-700 hover:underline">
              LOY-002 FDA status update (2026)
            </Link>
            .
          </p>
          <CheckSymptomsPromo variant="compact" className="mt-2" />
        </section>

        <CheckSymptomsPromo variant="banner" />

        <section className="space-y-4 rounded-3xl border border-primary/25 bg-primary/5 px-6 py-8 md:px-8 md:py-10">
          <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
            Most-searched emergency guides
          </h2>
          <p className="text-sm leading-snug text-muted-foreground">
            White foam vomit, fever, choking, and breathing changes—each links to related guides and the same{" "}
            <Link href="/check" className="font-medium text-emerald-700 hover:underline">
              symptom checker
            </Link>
            .
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {featuredEmergency.map((g) => (
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
        </section>

        <section className="space-y-4 rounded-3xl border border-border bg-card px-6 py-8 md:px-8 md:py-10">
          <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
            More emergency-style guides
          </h2>
          <p className="text-sm text-muted-foreground">
            Additional short pages (toxins, vomiting variants, “should I go to the vet,” night panting, and more).
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {otherEmergency.map((g) => (
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

        <CheckSymptomsPromo variant="banner" />
      </main>
      <SiteFooter />
    </div>
  );
}
