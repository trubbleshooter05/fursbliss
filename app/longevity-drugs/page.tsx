import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { EligibilityChecker } from "@/components/longevity/eligibility-checker";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dog Longevity Drug Hub (LOY-002) | FursBliss",
  description:
    "Track LOY-002 status, eligibility criteria, and readiness planning for longevity-focused pet owners.",
};

export default async function LongevityDrugsPage() {
  const statuses = await prisma.fDADrugStatus.findMany({
    orderBy: { drugName: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16 space-y-10">
        <section className="space-y-4">
          <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
            Longevity Drug Hub
          </Badge>
          <h1 className="text-4xl font-semibold text-slate-900">
            The first FDA dog longevity drug is coming.
          </h1>
          <p className="text-muted-foreground">
            Track LOY-002 status, eligibility, and readiness. FursBliss is not
            affiliated with Loyal or the FDA.
          </p>
          <p className="text-sm text-slate-700">
            Latest public update: FDA reviewers accepted Target Animal Safety (TAS)
            on Jan 13, 2026. LOY-002 now has efficacy + safety accepted, with
            manufacturing review remaining before XCA filing.
          </p>
          <a
            href="https://www.businesswire.com/news/home/20260113476778/"
            className="inline-block text-sm font-medium text-emerald-700 hover:underline"
          >
            Source: BusinessWire Jan 2026 update
          </a>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Is my dog eligible?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                LOY-002 targets senior dogs aged 10+ years and 14+ lbs. Run a quick
                check below.
              </p>
              <EligibilityChecker />
              <p className="text-xs">
                Drug availability and final label details may change with FDA review.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What LOY-002 does (plain English)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                LOY-002 is designed as a caloric-restriction mimetic to support
                healthy aging pathways in senior dogs.
              </p>
              <p>
                It is intended to be prescribed by a veterinarian, likely as a daily
                oral therapy if approved.
              </p>
              <p>
                Estimated market expectations have been discussed in the ~$40-90/mo
                range depending on dog size, but this is not final pricing guidance.
              </p>
              <Button variant="outline" asChild>
                <a href="/signup">Notify me when status changes</a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">FDA status tracker</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {statuses.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-sm text-muted-foreground">
                  FDA status data is being prepared. Check back soon.
                </CardContent>
              </Card>
            ) : (
              statuses.map((status) => {
                const milestones = safeParseMilestones(status.milestones);
                const approvedCount = milestones.filter((m) =>
                  /(accepted|approved)/i.test(m.event)
                ).length;
                const totalCount = Math.max(milestones.length, 3);
                const progress = Math.min(
                  100,
                  Math.round((approvedCount / totalCount) * 100)
                );

                return (
                <Card key={status.id}>
                  <CardHeader className="space-y-2">
                    <CardTitle>{status.drugName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {status.company}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-slate-900">Status: </span>
                      {status.currentStatus}
                    </p>
                    <p>{status.statusDetail}</p>
                    <div className="space-y-2">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs">
                        {approvedCount}/{totalCount} milestones completed
                      </p>
                    </div>
                    {milestones.length > 0 && (
                      <ul className="space-y-1 text-xs">
                        {milestones.map((milestone) => (
                          <li key={`${status.id}-${milestone.date}-${milestone.event}`}>
                            • {milestone.date}: {milestone.event}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p>
                      <span className="font-medium text-slate-900">Updated: </span>
                      {status.lastUpdated.toDateString()}
                    </p>
                    {status.estimatedApproval && (
                      <p>
                        <span className="font-medium text-slate-900">
                          Est. approval:{" "}
                        </span>
                        {status.estimatedApproval}
                      </p>
                    )}
                    {status.sourceUrl && (
                      <p>
                        <a
                          href={status.sourceUrl}
                          className="font-medium text-emerald-700 hover:underline"
                        >
                          Source link
                        </a>
                      </p>
                    )}
                  </CardContent>
                </Card>
              )})
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>January 2026 highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• TAS accepted by FDA CVM on Jan 13, 2026.</p>
              <p>• STAY study enrollment completed: 1,300 dogs across 70 clinics.</p>
              <p>• No clinically significant adverse events at 1x, 3x, and 5x doses.</p>
              <p>• Field safety dataset included 400+ dogs.</p>
              <p>• Loyal reports $150M+ total funding raised.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Timeline outlook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Manufacturing technical section remains in progress.</p>
              <p>• Loyal has publicly signaled XCA filing expectation in 2027.</p>
              <p>• Full approval follows STAY study completion.</p>
              <p>• LOY-001 and LOY-003 programs are also progressing.</p>
              <p className="text-xs">
                Dates reflect public company communications and may change.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rapamycin awareness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Rapamycin is currently available off-label through veterinarians and
                is being studied in canine longevity research.
              </p>
              <p>
                FursBliss helps owners track dosing, side effects, and outcomes over
                time with a dedicated module.
              </p>
              <Button variant="outline" asChild>
                <a href="/login">Open rapamycin tracking</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Important disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                FursBliss does not provide veterinary diagnosis or treatment. Always
                consult a licensed veterinarian for medication and supplement
                decisions.
              </p>
              <p>
                Drug status details are compiled from public announcements and may
                change.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function safeParseMilestones(
  value: string
): Array<{ date: string; event: string }> {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => ({
        date: typeof item?.date === "string" ? item.date : "Unknown",
        event: typeof item?.event === "string" ? item.event : "Unknown",
      }))
      .slice(0, 6);
  } catch {
    return [];
  }
}
