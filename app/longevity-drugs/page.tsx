import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { EligibilityChecker } from "@/components/longevity/eligibility-checker";
import { LoyNotifyForm } from "@/components/longevity/loy-notify-form";
import { AnimateIn } from "@/components/ui/animate-in";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is LOY-002?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LOY-002 is an investigational daily oral therapy from Loyal designed for senior dogs and intended to support healthy aging pathways.",
      },
    },
    {
      "@type": "Question",
      name: "When will LOY-002 be available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Public updates indicate efficacy and safety sections have been accepted, with manufacturing still in review. Conditional approval could potentially arrive in late 2026 to 2027 depending on review timing.",
      },
    },
    {
      "@type": "Question",
      name: "Is my dog eligible for LOY-002?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Current public criteria commonly referenced are senior dogs around 10+ years old and 14+ lbs, but final eligibility depends on regulatory labeling and veterinary guidance.",
      },
    },
    {
      "@type": "Question",
      name: "How much will LOY-002 cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Public pricing has not been announced yet.",
      },
    },
    {
      "@type": "Question",
      name: "What is the STAY clinical study?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "STAY is Loyal's large-scale clinical program for LOY-002. Public reporting references about 1,300 dogs enrolled across around 70 clinics with longitudinal follow-up.",
      },
    },
  ],
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "LOY-002 FDA Timeline & Dog Longevity Drug Tracker | FursBliss",
  description:
    "Track LOY-002's path to FDA conditional approval. RXE accepted, TAS accepted, manufacturing in review. Get milestone alerts.",
  alternates: {
    canonical: "/longevity-drugs",
  },
  openGraph: {
    title: "LOY-002 FDA Timeline & Dog Longevity Drug Tracker | FursBliss",
    description:
      "Track LOY-002's path to FDA conditional approval. RXE accepted, TAS accepted, manufacturing in review. Get milestone alerts.",
    url: "/longevity-drugs",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOY-002 FDA Timeline & Dog Longevity Drug Tracker | FursBliss",
    description:
      "Track LOY-002's path to FDA conditional approval. RXE accepted, TAS accepted, manufacturing in review. Get milestone alerts.",
    images: ["/og-default.jpg"],
  },
};

const drugComparison = [
  {
    name: "LOY-001",
    target: "Large/giant dogs, 7+ years, 40+ lbs",
    format: "Injectable (veterinarian-administered)",
    fdaStatus: "RXE accepted Nov 2023",
    timing: "Market target: 2026",
    source: "loy001" as const,
  },
  {
    name: "LOY-002",
    target: "Senior dogs, 10+ years, 14+ lbs",
    format: "Prescription daily oral therapy",
    fdaStatus: "Efficacy + safety accepted; manufacturing review pending",
    timing: "Conditional approval could arrive in 2026",
    source: "loy002" as const,
  },
  {
    name: "LOY-003",
    target: "Large/giant dogs, 7+ years, 40+ lbs",
    format: "Prescription pill alternative",
    fdaStatus: "In development",
    timing: "Under active pipeline development",
    source: "loy003" as const,
  },
];

export default async function LongevityDrugsPage() {
  const statuses = await prisma.fDADrugStatus.findMany({
    orderBy: { drugName: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-16 space-y-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(FAQ_JSON_LD),
          }}
        />
        <section className="section-molecule relative overflow-hidden rounded-3xl border border-border bg-[var(--color-section-alt)] p-8 md:p-10">
          <Image
            src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1800&q=80"
            alt="Senior dog in a clinical setting"
            fill
            sizes="100vw"
            className="object-cover opacity-15"
          />
          <div className="relative z-10 space-y-4">
          <AnimateIn className="space-y-4">
          <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
            Longevity Drug Hub
          </Badge>
          <h1 className="font-display text-5xl tracking-[-0.03em] text-foreground md:text-6xl">
            The first FDA dog longevity drug is coming.
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Track both major dog longevity approaches in one place: Loyal's LOY
            pipeline and Dog Aging Project TRIAD rapamycin research.
            FursBliss is not affiliated with Loyal, Dog Aging Project, NIH, or the FDA.
          </p>
          <p className="text-sm text-slate-700">
            Latest public update: FDA reviewers accepted Target Animal Safety (TAS)
            on Jan 13, 2026. LOY-002 now has efficacy + safety accepted, with
            manufacturing review remaining before XCA filing. Conditional approval
            could arrive as early as 2026 depending on manufacturing review timing.
          </p>
          <a
            href="https://www.businesswire.com/news/home/20260113476778/"
            className="inline-block text-sm font-medium text-emerald-700 hover:underline"
          >
            Source: BusinessWire Jan 2026 update
          </a>
          </AnimateIn>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <AnimateIn>
          <Card id="eligibility" className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Is my dog eligible?</CardTitle>
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
          </AnimateIn>
          <AnimateIn delay={0.1}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">What LOY-002 does (plain English)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Loyal has three public longevity programs in motion: LOY-001,
                LOY-002, and LOY-003.
              </p>
              <p>
                LOY-002 is designed as a caloric-restriction mimetic to support
                healthy aging pathways in senior dogs.
              </p>
              <p>
                Public reporting now suggests conditional approval timing could land
                as early as 2026, while manufacturing review is still a gating step.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h3 className="mb-1 font-semibold text-slate-900">
                  Get notified when LOY-002 updates
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Be first to know about approval milestones, manufacturing updates,
                  and potential availability timelines.
                </p>
                <LoyNotifyForm source="loy002" />
              </div>
            </CardContent>
          </Card>
          </AnimateIn>
        </section>

        <section className="space-y-4">
          <AnimateIn>
            <h2 className="font-display text-4xl text-foreground">Loyal pipeline comparison</h2>
          </AnimateIn>
          <div className="grid gap-4 md:grid-cols-3">
            {drugComparison.map((drug, index) => (
              <AnimateIn key={drug.name} delay={index * 0.08}>
                <Card className="h-full rounded-2xl border-border bg-card">
                  <CardHeader className="space-y-2">
                    <CardTitle className="font-display text-2xl">{drug.name}</CardTitle>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Drug snapshot
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-slate-900">Target:</span> {drug.target}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Format:</span> {drug.format}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">FDA status:</span> {drug.fdaStatus}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Outlook:</span> {drug.timing}
                    </p>
                    <div className="pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href="#eligibility">Check eligibility</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimateIn>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <AnimateIn>
            <h2 className="font-display text-4xl text-foreground">
              LOY-002 vs TRIAD Rapamycin
            </h2>
          </AnimateIn>
          <AnimateIn delay={0.06}>
            <Card className="rounded-2xl border-border">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-3 text-left font-semibold text-foreground">Category</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">LOY-002 (Loyal)</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">
                          Rapamycin (TRIAD / Dog Aging Project)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/70">
                        <td className="px-3 py-3 text-foreground">Type</td>
                        <td className="px-3 py-3 text-muted-foreground">Daily pill</td>
                        <td className="px-3 py-3 text-muted-foreground">Weekly pill (research protocol)</td>
                      </tr>
                      <tr className="border-b border-border/70">
                        <td className="px-3 py-3 text-foreground">Mechanism</td>
                        <td className="px-3 py-3 text-muted-foreground">Caloric restriction mimetic</td>
                        <td className="px-3 py-3 text-muted-foreground">mTOR inhibitor</td>
                      </tr>
                      <tr className="border-b border-border/70">
                        <td className="px-3 py-3 text-foreground">Age target</td>
                        <td className="px-3 py-3 text-muted-foreground">10+ years</td>
                        <td className="px-3 py-3 text-muted-foreground">7+ years</td>
                      </tr>
                      <tr className="border-b border-border/70">
                        <td className="px-3 py-3 text-foreground">Weight target</td>
                        <td className="px-3 py-3 text-muted-foreground">14+ lbs</td>
                        <td className="px-3 py-3 text-muted-foreground">44+ lbs</td>
                      </tr>
                      <tr className="border-b border-border/70">
                        <td className="px-3 py-3 text-foreground">Trial size</td>
                        <td className="px-3 py-3 text-muted-foreground">1,300 dogs (STAY)</td>
                        <td className="px-3 py-3 text-muted-foreground">580 target (180+ enrolled as of Feb 2026)</td>
                      </tr>
                      <tr className="border-b border-border/70">
                        <td className="px-3 py-3 text-foreground">Regulatory path</td>
                        <td className="px-3 py-3 text-muted-foreground">Toward FDA conditional approval</td>
                        <td className="px-3 py-3 text-muted-foreground">Research trial (not an FDA approval program)</td>
                      </tr>
                      <tr className="border-b border-border/70">
                        <td className="px-3 py-3 text-foreground">Timeline</td>
                        <td className="px-3 py-3 text-muted-foreground">
                          Conditional approval could be 2026 to 2027
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          Trial follow-up through 2029 (study end Nov 2029)
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-3 text-foreground">Funding source</td>
                        <td className="px-3 py-3 text-muted-foreground">Private venture funding ($250M+)</td>
                        <td className="px-3 py-3 text-muted-foreground">$7M NIH funding for TRIAD progression</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
        </section>

        <section className="space-y-4">
          <AnimateIn>
          <h2 className="font-display text-4xl text-foreground">FDA status tracker</h2>
          </AnimateIn>
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
                <AnimateIn key={status.id}>
                <Card className="rounded-2xl border-border">
                  <CardHeader className="space-y-2">
                    <CardTitle className="font-display text-2xl">{status.drugName}</CardTitle>
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
                </AnimateIn>
              )})
            )}
          </div>
        </section>

        <section className="space-y-4">
          <AnimateIn>
            <h2 className="font-display text-3xl text-foreground">Keep learning</h2>
          </AnimateIn>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a href="/quiz">Take the free longevity quiz</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/blog/loy-002-vs-rapamycin-triad-2026-update">
                LOY-002 vs Rapamycin analysis
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/blog/loyal-series-c-funding-feb-2026">
                Loyal funding timeline update
              </a>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <AnimateIn>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">January 2026 highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• TAS accepted by FDA CVM on Jan 13, 2026.</p>
              <p>• STAY study enrollment completed: 1,300 dogs across 70 clinics.</p>
              <p>• No clinically significant adverse events at 1x, 3x, and 5x doses.</p>
              <p>• Field safety dataset included 400+ dogs.</p>
              <p>• Loyal now reports $250M+ total funding raised.</p>
              <p>
                • Series C: $100M raised Feb 11, 2026, led by age1 (Laura Deming&apos;s
                Longevity Fund) and Baillie Gifford.
              </p>
            </CardContent>
          </Card>
          </AnimateIn>
          <AnimateIn delay={0.1}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Timeline outlook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Manufacturing technical section remains in progress.</p>
              <p>• Loyal has publicly signaled XCA filing expectation in 2027.</p>
              <p>• LOY-001 for large dogs is also anticipated for market in 2026.</p>
              <p>
                • LOY-003 is a pill program for large and giant breed longevity support.
              </p>
              <p>
                • STAY study sampling includes a longitudinal biobank (saliva + blood)
                that may accelerate future insights.
              </p>
              <p>• Full approval follows STAY study completion.</p>
              <p className="text-xs">
                Dates reflect public company communications and may change.
              </p>
            </CardContent>
          </Card>
          </AnimateIn>
        </section>

        <section className="space-y-6">
          <AnimateIn>
            <h2 className="font-display text-4xl text-foreground">Drug deep dives</h2>
          </AnimateIn>
          <div className="grid gap-6">
            <AnimateIn>
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">LOY-001 (large and giant breeds)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    LOY-001 targets dogs 7+ years and 40+ lbs. The mechanism is
                    focused on reducing overexpression of IGF-1 and growth hormone
                    after maturity.
                  </p>
                  <p>
                    FDA status: RXE accepted in November 2023. Loyal has publicly
                    signaled a 2026 market target.
                  </p>
                  <p>
                    Expected format: injectable, administered by a veterinarian.
                  </p>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      Stay updated on LOY-001
                    </p>
                    <LoyNotifyForm source="loy001" />
                  </div>
                </CardContent>
              </Card>
            </AnimateIn>
            <AnimateIn delay={0.08}>
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">LOY-003 (pill alternative)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    LOY-003 targets the same large/giant population as LOY-001 but
                    is being developed as a daily prescription pill.
                  </p>
                  <p>
                    Mechanism: same longevity pathway strategy as LOY-001 with a
                    pill-based format for daily use under veterinary guidance.
                  </p>
                  <p>Current status: in development.</p>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      Stay updated on LOY-003
                    </p>
                    <LoyNotifyForm source="loy003" />
                  </div>
                </CardContent>
              </Card>
            </AnimateIn>
            <AnimateIn delay={0.16}>
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">LOY-002 (senior dogs)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Conditional approval could come as early as 2026 based on current
                    public timelines, while manufacturing section review remains a
                    key milestone.
                  </p>
                  <p>
                    STAY study enrollment is complete with 1,300 dogs across 70
                    clinics, launched Dec 2023 with an expected ~4 year duration.
                  </p>
                  <p>
                    Loyal has also communicated plans for a longitudinal biobank from
                    STAY samples to support deeper longevity insights.
                  </p>
                </CardContent>
              </Card>
            </AnimateIn>
          </div>
          <AnimateIn delay={0.24}>
            <p className="text-xs text-muted-foreground">
              Sources: Loyal public updates, BusinessWire announcements, dvm360 (Feb
              2026), and additional public reporting. Milestones can change with FDA
              review.
            </p>
          </AnimateIn>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <AnimateIn>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">TRIAD Rapamycin update (Feb 14, 2026)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Rapamycin is an mTOR-pathway inhibitor being tested for potential
                healthspan and lifespan effects in aging dogs.
              </p>
              <p>
                The Dog Aging Project published TRIAD methodology in GeroScience,
                framing it as a rigorous pharmacologic aging-intervention test in
                real-world companion dogs.
              </p>
              <p>
                TRIAD is still enrolling dogs (7+ years, 44+ lbs) across 20 trial
                sites, targeting 580 total with about 180 enrolled so far.
                Medication is projected to begin in spring 2026, and the study is
                expected to conclude in Nov 2029.
              </p>
              <p>
                Prior Dog Aging Project work reported small-dose rapamycin signals
                for improved cardiac function, supporting continued investigation.
              </p>
              <a
                href="https://dogagingproject.org/triad/"
                className="inline-block font-medium text-emerald-700 hover:underline"
              >
                Dog Aging Project TRIAD enrollment page
              </a>
              <div className="grid gap-2 text-xs">
                <a
                  href="https://www.avma.org/news/dog-aging-project-lands-major-grant-anti-aging-trial"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Source: AVMA coverage on TRIAD enrollment and NIH funding
                </a>
                <a
                  href="https://vetmed.tamu.edu/news/press-releases/rapamycin-improves-heart-function-in-middle-aged-companion-dogs/"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Source: Texas A&M VetMed on prior rapamycin cardiac findings
                </a>
              </div>
            </CardContent>
          </Card>
          </AnimateIn>
          <AnimateIn delay={0.1}>
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Important disclaimer</CardTitle>
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
          </AnimateIn>
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
