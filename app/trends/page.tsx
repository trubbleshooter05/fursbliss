import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Trends
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Community wellness insights
          </h1>
          <p className="text-muted-foreground">
            Aggregated, anonymized insights from the FursBliss community.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top breeds logged</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {topBreeds.length === 0 ? (
                <p>No data yet.</p>
              ) : (
                topBreeds.map(([breed, count]) => (
                  <p key={breed}>
                    {breed}: <span className="font-semibold text-slate-900">{count}</span>
                  </p>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most logged symptoms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {topSymptoms.length === 0 ? (
                <p>No data yet.</p>
              ) : (
                topSymptoms.map(([symptom, count]) => (
                  <p key={symptom}>
                    {symptom}: <span className="font-semibold text-slate-900">{count}</span>
                  </p>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
