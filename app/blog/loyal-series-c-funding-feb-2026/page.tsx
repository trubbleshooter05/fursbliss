import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Loyal Series C Funding News (Feb 2026) | FursBliss Blog",
  description:
    "Loyal raised $100M in a Feb 2026 Series C, bringing total funding to $250M+. What this means for LOY-001, LOY-002, and LOY-003 timelines.",
  alternates: {
    canonical: "/blog/loyal-series-c-100m-loy-002-update",
  },
  openGraph: {
    title: "Loyal Series C Funding News (Feb 2026) | FursBliss Blog",
    description:
      "Loyal raised $100M in a Feb 2026 Series C, bringing total funding to $250M+. What this means for LOY-001, LOY-002, and LOY-003 timelines.",
    url: "/blog/loyal-series-c-100m-loy-002-update",
    type: "article",
  },
};

export default function LoyalFundingPostPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <article className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Feb 11, 2026 · Breaking update
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            Loyal raises $100M Series C, bringing total funding to $250M+
          </h1>
          <p className="text-muted-foreground">
            Loyal announced a $100M Series C on Feb 11, 2026, led by age1
            (Laura Deming&apos;s Longevity Fund) and Baillie Gifford. This brings
            total company funding to $250M+ and strengthens execution confidence
            across LOY-001, LOY-002, and LOY-003.
          </p>

          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Why this matters for owners:</p>
              <p>
                • More capital supports manufacturing, regulatory execution, and
                commercial readiness.
              </p>
              <p>
                • LOY-002 timelines remain tied to remaining manufacturing review
                milestones.
              </p>
              <p>
                • The broader Loyal pipeline (LOY-001/002/003) now has stronger
                financial backing.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/longevity-drugs"
              className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]"
            >
              View live drug hub updates
            </Link>
            <Link
              href="/quiz"
              className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Take the longevity quiz
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

