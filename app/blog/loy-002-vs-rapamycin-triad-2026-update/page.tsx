import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";

const SHARE_IMAGE_URL = "/opengraph-image";
const PUBLISHED_AT = "2026-02-14T00:00:00.000Z";
const UPDATED_AT = "2026-02-14T00:00:00.000Z";

export const metadata: Metadata = {
  title: "LOY-002 vs Rapamycin: Two Paths to Dog Longevity | FursBliss",
  description:
    "Compare LOY-002 and TRIAD rapamycin for dogs by mechanism, eligibility, trial size, timeline, and expected availability.",
  alternates: {
    canonical: "/blog/loy-002-vs-rapamycin-triad-2026-update",
  },
  openGraph: {
    title: "LOY-002 vs Rapamycin: Two Paths to Dog Longevity | FursBliss",
    description:
      "Two different approaches to dog longevity are now progressing in parallel. See the practical differences.",
    url: "/blog/loy-002-vs-rapamycin-triad-2026-update",
    type: "article",
    images: [SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOY-002 vs Rapamycin: Two Paths to Dog Longevity | FursBliss",
    description:
      "Compare LOY-002 and TRIAD rapamycin for dogs by mechanism, eligibility, trial size, timeline, and expected availability.",
    images: [SHARE_IMAGE_URL],
  },
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "LOY-002 vs Rapamycin: Two Paths to Dog Longevity",
  description:
    "Compare LOY-002 and TRIAD rapamycin for dogs by mechanism, eligibility, trial size, timeline, and expected availability.",
  datePublished: PUBLISHED_AT,
  dateModified: UPDATED_AT,
  author: {
    "@type": "Organization",
    name: "FursBliss",
  },
  publisher: {
    "@type": "Organization",
    name: "FursBliss",
  },
  mainEntityOfPage: "https://www.fursbliss.com/blog/loy-002-vs-rapamycin-triad-2026-update",
};

const rows = [
  ["Type", "Daily pill", "Weekly pill"],
  ["Mechanism", "Caloric restriction mimetic", "mTOR inhibitor"],
  ["Age", "10+ years", "7+ years"],
  ["Weight", "14+ lbs", "44+ lbs"],
  ["Trial size", "1,300 dogs", "580 target (180+ enrolled)"],
  ["FDA status", "2 of 3 major requirements accepted", "Research program, not FDA approval pathway"],
  ["Timeline", "Conditional approval possible 2026-2027", "Results expected by 2029"],
  ["Funding", "$250M+ private funding", "$7M NIH grant"],
  ["Availability", "Prescription if/when approved", "Off-label use exists; TRIAD itself is trial-only"],
];

export default function LoyVsTriadPostPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ARTICLE_JSON_LD),
          }}
        />
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Blog - Feb 14, 2026
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            LOY-002 vs Rapamycin: Two Paths to Dog Longevity
          </h1>
          <p className="text-muted-foreground">
            Dog longevity research now has two major tracks moving at the same time.
            FursBliss tracks both in one place so owners can make calmer, better-informed
            decisions with their vet.
          </p>
        </div>

        <Card className="mt-8 rounded-2xl border-border bg-card">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <p>
              The TRIAD methodology publication in GeroScience marks a significant milestone
              for the Dog Aging Project's rapamycin trial. Alongside Loyal's STAY program for
              LOY-002, owners now have two distinct longevity frameworks worth understanding.
            </p>
            <p>
              One path emphasizes a purpose-built longevity therapy moving through FDA conditional
              approval. The other path evaluates rapamycin in a large real-world trial with
              healthspan and lifespan endpoints.
            </p>
          </CardContent>
        </Card>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">Side-by-side comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[740px] border-collapse text-sm">
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
                {rows.map((row) => (
                  <tr key={row[0]} className="border-b border-border/70 last:border-b-0">
                    <td className="px-3 py-3 text-foreground">{row[0]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row[1]}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 space-y-3 text-sm text-muted-foreground">
          <h2 className="font-display text-3xl text-foreground">What this means for owners</h2>
          <p>
            If your dog is younger and larger, TRIAD-style criteria may match earlier than LOY-002.
            If your dog is older and meets LOY-002 criteria, readiness tracking matters now so you
            have baseline data when treatment decisions come faster.
          </p>
          <p>
            The practical advantage is not choosing a side. It is tracking daily data so your vet has
            cleaner evidence, whichever path you consider.
          </p>
          <p>
            Read the live tracker on the{" "}
            <Link href="/longevity-drugs" className="text-emerald-700 hover:underline">
              Longevity Drug Hub
            </Link>
            {" "}and run your dog through the{" "}
            <Link href="/longevity-drugs#eligibility" className="text-emerald-700 hover:underline">
              eligibility checker
            </Link>
            {" "}or start with the{" "}
            <Link href="/quiz" className="text-emerald-700 hover:underline">
              free longevity quiz
            </Link>
            {" "}and try{" "}
            <Link href="/walks-left" className="text-emerald-700 hover:underline">
              How Many Walks Left
            </Link>
            {" "}to visualize the moments that matter most.
          </p>
        </section>

        <section className="mt-8 space-y-2 text-xs text-muted-foreground">
          <p>Sources:</p>
          <ul className="space-y-1">
            <li>
              - AVMA: TRIAD progress, enrollment, NIH grant update
            </li>
            <li>
              - Texas A&amp;M VetMed: prior rapamycin cardiac-function findings in companion dogs
            </li>
            <li>
              - Loyal public updates for LOY pipeline and STAY program context
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
