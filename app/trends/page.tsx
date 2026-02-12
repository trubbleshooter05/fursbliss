import type { Metadata } from "next";
import { ActivitySquare, BarChart3, PawPrint } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimateIn } from "@/components/ui/animate-in";

export const metadata: Metadata = {
  title: "Pet Wellness Trends | FursBliss",
  description:
    "Explore anonymized wellness trends across breeds, symptoms, and longevity-focused tracking behaviors.",
};

export default async function TrendsPage() {
  const pets = await prisma.pet.findMany({
    select: { breed: true, symptoms: true },
  });

  const breedCounts = pets.reduce<Record<string, number>>((acc, pet) => {
    acc[pet.breed] = (acc[pet.breed] ?? 0) + 1;
    return acc;
  }, {});

  const symptomCounts = pets.reduce<Record<string, number>>((acc, pet) => {
    const symptoms = Array.isArray(pet.symptoms)
      ? pet.symptoms.filter((symptom): symptom is string => typeof symptom === "string")
      : [];
    symptoms.forEach((symptom) => {
      acc[symptom] = (acc[symptom] ?? 0) + 1;
    });
    return acc;
  }, {});

  const topBreeds = Object.entries(breedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16 space-y-10">
        <AnimateIn className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Trends
          </p>
          <h1 className="font-display text-5xl tracking-[-0.03em] text-foreground md:text-6xl">
            Community wellness insights
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Aggregated, anonymized insights from the FursBliss community.
          </p>
          <p className="text-xs text-muted-foreground">
            Trend data should support questions for your veterinarian, not replace
            clinical guidance.
          </p>
        </AnimateIn>

        <div className="grid gap-4 md:grid-cols-3">
          <AnimateIn>
            <Card className="rounded-2xl border-border">
              <CardContent className="flex items-center gap-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Cross-breed trend tracking</p>
                  <p className="text-xs text-muted-foreground">Pattern visibility across cohorts</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <Card className="rounded-2xl border-border">
              <CardContent className="flex items-center gap-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/25 text-accent-foreground">
                  <PawPrint className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{pets.length.toLocaleString()} pets analyzed</p>
                  <p className="text-xs text-muted-foreground">Anonymized profile data only</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <Card className="rounded-2xl border-border">
              <CardContent className="flex items-center gap-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ActivitySquare className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Early signal watch</p>
                  <p className="text-xs text-muted-foreground">Supports smarter vet conversations</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimateIn delay={0.1}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Top breeds logged</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {topBreeds.length === 0 ? (
                <p>No data yet.</p>
              ) : (
                topBreeds.map(([breed, count]) => (
                  <div key={breed} className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                    <p>{breed}</p>
                    <span className="stat-number font-semibold text-foreground">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          </AnimateIn>

          <AnimateIn delay={0.2}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Most logged symptoms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {topSymptoms.length === 0 ? (
                <p>No data yet.</p>
              ) : (
                topSymptoms.map(([symptom, count]) => (
                  <div key={symptom} className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                    <p>{symptom}</p>
                    <span className="stat-number font-semibold text-foreground">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          </AnimateIn>
        </div>
        <AnimateIn delay={0.25} className="flex gap-3">
          <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
            <a href="/breeds">Browse breed guides</a>
          </Button>
          <Button variant="outline" className="hover:scale-[1.02] transition-all duration-300" asChild>
            <a href="/signup">Track your pet</a>
          </Button>
        </AnimateIn>
      </main>
      <SiteFooter />
    </div>
  );
}
