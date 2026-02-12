import type { Metadata } from "next";
import { Users, Trophy, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimateIn } from "@/components/ui/animate-in";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Community Longevity Leaderboards | FursBliss",
  description:
    "See anonymized longevity trends and breed activity from the FursBliss community.",
};

export default async function CommunityPage() {
  const aggregates = await prisma.breedAggregate.findMany({
    orderBy: { totalPets: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16 space-y-10">
        <AnimateIn className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Community
          </p>
          <h1 className="font-display text-5xl tracking-[-0.03em] text-foreground md:text-6xl">
            Longevity leaderboards
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Celebrate senior pets and the most tracked longevity stacks.
          </p>
          <p className="text-xs text-muted-foreground">
            Community metrics are aggregated and anonymized.
          </p>
        </AnimateIn>

        <div className="grid gap-4 md:grid-cols-3">
          <AnimateIn>
            <Card className="rounded-2xl border-border bg-card">
              <CardContent className="flex items-center gap-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{aggregates.length || "—"} tracked breeds</p>
                  <p className="text-xs text-muted-foreground">Across active community profiles</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <Card className="rounded-2xl border-border bg-card">
              <CardContent className="flex items-center gap-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
                  <Trophy className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Leaderboard refreshes daily</p>
                  <p className="text-xs text-muted-foreground">Highlights momentum and consistency</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <Card className="rounded-2xl border-border bg-card">
              <CardContent className="flex items-center gap-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Anonymized trend cohorts</p>
                  <p className="text-xs text-muted-foreground">Privacy-first benchmarking</p>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimateIn delay={0.1}>
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Top breeds on FursBliss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {aggregates.length === 0 ? (
                <p>No community data yet.</p>
              ) : (
                aggregates.map((agg) => (
                  <div key={agg.id} className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                    <p>{agg.breed}</p>
                    <span className="stat-number font-semibold text-foreground">{agg.totalPets}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          </AnimateIn>

          <AnimateIn delay={0.2}>
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Longevity streaks and age milestones will appear here.</p>
              <p>Weekly adherence leaders and consistency medals are coming next.</p>
            </CardContent>
          </Card>
          </AnimateIn>
        </div>
        <AnimateIn delay={0.25} className="flex gap-3">
          <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
            <a href="/trends">View full trends</a>
          </Button>
          <Button variant="outline" className="hover:scale-[1.02] transition-all duration-300" asChild>
            <a href="/signup">Join FursBliss</a>
          </Button>
        </AnimateIn>
      </main>
      <SiteFooter />
    </div>
  );
}
