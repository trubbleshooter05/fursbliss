import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const aggregates = await prisma.breedAggregate.findMany({
    orderBy: { totalPets: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-16 space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Community
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Longevity leaderboards
          </h1>
          <p className="text-muted-foreground">
            Celebrate senior pets and the most tracked longevity stacks.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top breeds on FursBliss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {aggregates.length === 0 ? (
                <p>No community data yet.</p>
              ) : (
                aggregates.map((agg) => (
                  <p key={agg.id}>
                    {agg.breed}:{" "}
                    <span className="font-semibold text-slate-900">{agg.totalPets}</span>
                  </p>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Longevity streaks and age milestones will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
