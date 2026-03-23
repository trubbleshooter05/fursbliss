import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { InlineEmailCapture } from "@/components/blog/inline-email-capture";
import { BlogBottomCTA } from "@/components/blog/blog-bottom-cta";

const SHARE_IMAGE_URL = "/opengraph-image";
const SLUG = "loy-002-fda-timeline";
const PUBLISHED_AT = "2026-03-22T00:00:00.000Z";
const UPDATED_AT = "2026-03-22T00:00:00.000Z";

export const metadata: Metadata = {
  title: "LOY-002 FDA Approval Timeline & Date (2027 Manufacturing Step) | FursBliss",
  description:
    "LOY-002 FDA update: RXE accepted Feb 2025, Target Animal Safety Jan 2026. Manufacturing (CMC) is the last section — expected 2027. Realistic LOY-002 approval timeline and what to do while you wait.",
  keywords: [
    "LOY-002 approval date",
    "LOY-002 FDA",
    "LOY-002 timeline",
    "Loyal LOY-002",
    "dog longevity drug",
    "FDA expanded conditional approval",
  ],
  alternates: {
    canonical: `/blog/${SLUG}`,
  },
  openGraph: {
    title: "LOY-002 FDA Approval Timeline: What the Final Manufacturing Step Means",
    description:
      "Two of three FDA technical sections are cleared for LOY-002. Here’s the realistic approval timeline, what manufacturing review means, and what senior dog owners can do now.",
    url: `/blog/${SLUG}`,
    type: "article",
    images: [SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOY-002 FDA Approval Timeline: What the Final Manufacturing Step Means",
    description:
      "Two of three FDA technical sections are cleared for LOY-002. Here’s the realistic timeline and what to do while you wait.",
    images: [SHARE_IMAGE_URL],
  },
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "LOY-002 FDA Approval Timeline: What the Final Manufacturing Step Means for Your Senior Dog",
  description:
    "LOY-002 FDA update: RXE and Target Animal Safety accepted; Chemistry, Manufacturing, and Controls expected in 2027. Timeline, STAY study context, and practical steps for owners.",
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
  mainEntityOfPage: `https://www.fursbliss.com/blog/${SLUG}`,
};

export default function Loy002FdaTimelinePostPage() {
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
            Blog · Updated March 22, 2026
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            LOY-002 FDA Approval Timeline: What the Final Manufacturing Step Means for Your Senior Dog
          </h1>
          <p className="text-muted-foreground">
            If you&apos;re a senior dog owner, you&apos;ve probably heard the buzz about LOY-002 — the
            first drug ever designed to extend healthy lifespan in dogs. With two of three FDA milestones
            now cleared, the question on every dog parent&apos;s mind is:{" "}
            <strong className="text-foreground">when can I actually get this for my dog?</strong>
          </p>
          <p className="text-muted-foreground">
            Here&apos;s exactly where things stand in March 2026, what the final step involves, and what
            you can do right now while you wait.
          </p>
        </div>

        <Card className="mt-8 rounded-2xl border-border bg-card">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Note:</strong> This article is for informational
              purposes only and is not veterinary advice. FDA timelines are projections based on public
              company statements; approval is never guaranteed. FursBliss is not affiliated with Loyal.
            </p>
          </CardContent>
        </Card>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">Where LOY-002 stands right now</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              LOY-002 is being developed by Loyal, a San Francisco-based biotech company, under the
              FDA&apos;s Expanded Conditional Approval (XCA) pathway. This is a newer regulatory route
              designed to get innovative therapies to market faster while maintaining safety and
              manufacturing standards.
            </p>
            <p>
              To earn conditional approval, Loyal needs the FDA to accept three major technical sections:
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-3 text-left font-semibold text-foreground">
                    Technical Section
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-foreground">Status</th>
                  <th className="px-3 py-3 text-left font-semibold text-foreground">Date Accepted</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 font-medium text-foreground">
                    Reasonable Expectation of Effectiveness (RXE)
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">✅ Accepted</td>
                  <td className="px-3 py-3 text-muted-foreground">February 2025</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 font-medium text-foreground">Target Animal Safety (TAS)</td>
                  <td className="px-3 py-3 text-muted-foreground">✅ Accepted</td>
                  <td className="px-3 py-3 text-muted-foreground">January 2026</td>
                </tr>
                <tr className="border-b border-border/70 last:border-b-0">
                  <td className="px-3 py-3 font-medium text-foreground">
                    Chemistry, Manufacturing, and Controls (CMC)
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">⏳ In Progress</td>
                  <td className="px-3 py-3 text-muted-foreground">Expected 2027</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Two down, one to go. The effectiveness and safety sections are done. The only remaining
            hurdle is manufacturing.
          </p>
        </section>

        <InlineEmailCapture slug={SLUG} />

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            What the manufacturing section actually means
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The final step — Chemistry, Manufacturing, and Controls (CMC) — isn&apos;t about whether
              the drug works or whether it&apos;s safe. Those questions are already answered. The CMC
              section is about proving that Loyal can:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="text-foreground">Produce LOY-002 consistently</strong> at scale,
                batch after batch
              </li>
              <li>
                <strong className="text-foreground">Meet FDA quality standards</strong> for ingredients,
                formulation, and packaging
              </li>
              <li>
                <strong className="text-foreground">Maintain stability</strong> so the drug stays
                effective through its shelf life
              </li>
              <li>
                <strong className="text-foreground">Document every step</strong> of the manufacturing
                process to FDA specifications
              </li>
            </ul>
            <p>
              This is the same manufacturing standard applied to every FDA-approved veterinary drug.
              It&apos;s rigorous, but it&apos;s also the most predictable part of the process — unlike
              clinical trials, manufacturing validation follows well-established protocols.
            </p>
            <p>Loyal has stated they anticipate this section being reviewed in 2027.</p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">The safety data behind LOY-002</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The FDA&apos;s acceptance of the Target Animal Safety section in January 2026 was a major
              milestone. Here&apos;s what Loyal submitted:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                A standard safety study conducted at <strong className="text-foreground">1x, 3x, and 5x</strong>{" "}
                doses with no clinically significant adverse events observed
              </li>
              <li>
                Field safety data from <strong className="text-foreground">over 400 dogs</strong> already
                taking LOY-002 as part of the STAY clinical trial
              </li>
              <li>
                Data from dogs with the kinds of health conditions and medications that senior dogs
                commonly have
              </li>
            </ul>
            <p>
              The FDA reviewed all of this and determined that the data supports LOY-002&apos;s safety
              for its intended use. For a preventive drug given to otherwise healthy senior dogs, this
              is a high bar — and Loyal cleared it.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            The STAY study: the largest dog clinical trial ever
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Loyal&apos;s pivotal clinical trial, called the STAY study, is remarkable in scale:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="text-foreground">1,300 dogs</strong> enrolled
              </li>
              <li>
                <strong className="text-foreground">70 veterinary clinics</strong> across the United States
              </li>
              <li>Half receive LOY-002 (a daily beef-flavored pill), half receive placebo</li>
              <li>
                Dogs must be <strong className="text-foreground">10 years or older</strong> and weigh{" "}
                <strong className="text-foreground">at least 14 pounds</strong>
              </li>
              <li>
                The study is designed to run <strong className="text-foreground">4 years</strong>
              </li>
            </ul>
            <p>
              It&apos;s the largest clinical trial in the history of veterinary medicine. The data from
              STAY will ultimately support Loyal&apos;s application for full FDA approval (beyond
              conditional approval).
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">How LOY-002 actually works</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              LOY-002 targets something called{" "}
              <strong className="text-foreground">age-related metabolic dysfunction</strong> — the gradual
              breakdown in how a dog&apos;s body processes energy, regulates hormones, and maintains
              cellular health as it ages.
            </p>
            <p>
              Specifically, LOY-002 works as a caloric restriction mimetic, targeting excess IGF-1
              (insulin-like growth factor 1) activity in older dogs. Research has shown that smaller dog
              breeds naturally have lower IGF-1 levels and live significantly longer than large breeds.
              LOY-002 aims to help senior dogs&apos; metabolisms behave more like those of naturally
              long-lived smaller dogs.
            </p>
            <p>
              The goal isn&apos;t just to add years — it&apos;s to add <strong className="text-foreground">healthy</strong>{" "}
              years. More time running, playing, eating well, and being present with their families.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            Realistic timeline: when could you get LOY-002?
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Based on what Loyal has publicly shared:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="text-foreground">2027:</strong> Manufacturing section submitted and
                reviewed by FDA
              </li>
              <li>
                <strong className="text-foreground">2027–2028:</strong> If approved under XCA, LOY-002
                becomes available through veterinarians under conditional approval
              </li>
              <li>
                <strong className="text-foreground">2028+:</strong> STAY study data continues to
                accumulate toward full approval
              </li>
            </ul>
            <p>
              Conditional approval means veterinarians could prescribe LOY-002 while the longer-term STAY
              study continues. This is similar to how many human drugs reach patients through accelerated
              pathways.
            </p>
            <p>
              <strong className="text-foreground">Important caveat:</strong> FDA approval is never
              guaranteed. These are projections based on Loyal&apos;s public statements, not confirmed
              dates — including any search for an exact &quot;LOY-002 approval date&quot; before the FDA
              acts.
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">What you can do right now</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              LOY-002 isn&apos;t available yet. But the conditions it targets — declining mobility, joint
              stiffness, reduced energy, metabolic changes — are happening to your senior dog today.
            </p>
            <p>
              The single most impactful thing you can do while waiting for LOY-002 is{" "}
              <strong className="text-foreground">start tracking your dog&apos;s health changes now</strong>.
            </p>
            <p>Here&apos;s why this matters:</p>
            <p>
              <strong className="text-foreground">1. You&apos;ll catch declines earlier.</strong> A dog
              that&apos;s &quot;slowing down&quot; might be experiencing gradual mobility loss that&apos;s
              invisible day-to-day but obvious when you look at a 30-day trend.
            </p>
            <p>
              <strong className="text-foreground">2. Your vet visits become more productive.</strong>{" "}
              Instead of saying &quot;she seems stiff sometimes,&quot; you can show your vet a timeline of
              mobility scores, appetite changes, and activity levels. Data changes the conversation.
            </p>
            <p>
              <strong className="text-foreground">3. When LOY-002 arrives, you&apos;ll have a baseline.</strong>{" "}
              If your dog starts LOY-002 in 2027 or 2028, having 12–18 months of tracked health data
              means you and your vet can actually measure whether it&apos;s working.
            </p>
          </div>

          <h3 className="mt-6 font-display text-2xl text-foreground">FursBliss: built for exactly this</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <Link href="/" className="font-medium text-emerald-700 hover:underline">
                FursBliss
              </Link>{" "}
              is a free senior dog health tracker that lets you:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="text-foreground">Log daily wellness</strong> — mobility, appetite,
                energy, mood in under 60 seconds
              </li>
              <li>
                <strong className="text-foreground">See trends over time</strong> — spot gradual declines
                before they become emergencies
              </li>
              <li>
                <strong className="text-foreground">Generate vet-ready reports</strong> — share a PDF
                summary with your veterinarian
              </li>
              <li>
                <strong className="text-foreground">Get breed-specific insights</strong> — understand
                what&apos;s normal aging vs. a red flag for your dog&apos;s breed
              </li>
            </ul>
            <p>
              We built FursBliss because we&apos;re senior dog owners too. Our Aussiedoodle Luna is the
              reason this exists — watching her slow down made us realize we needed better tools than a
              notebook and memory.
            </p>
            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]"
              >
                Start tracking your senior dog&apos;s health for free →
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">The bigger picture</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              LOY-002 represents a fundamental shift in how we think about aging in dogs. Instead of
              treating diseases one by one as they appear, it targets the underlying process that causes
              them all.
            </p>
            <p>
              But a drug alone isn&apos;t enough. The dogs who will benefit most from LOY-002 are the
              ones whose owners are already paying attention — tracking changes, catching issues early,
              and having informed conversations with their vets.
            </p>
            <p>Start now. Your future self — and your dog — will thank you.</p>
          </div>
        </section>

        <section className="mt-10 space-y-4 rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            This article is for informational purposes only and is not veterinary advice. Consult your
            veterinarian about your dog&apos;s health needs. FursBliss is not affiliated with Loyal.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm">
          <p className="font-semibold text-foreground">Related</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/blog/loy-002-vs-rapamycin-triad-2026-update" className="text-emerald-700 hover:underline">
                LOY-002 vs Rapamycin: Two Paths to Dog Longevity
              </Link>
            </li>
            <li>
              <Link href="/blog/loyal-series-c-funding-feb-2026" className="text-emerald-700 hover:underline">
                Loyal Raises $100M Series C — What It Means for LOY-002
              </Link>
            </li>
            <li>
              <Link href="/blog/rapamycin-for-dogs-2026-guide" className="text-emerald-700 hover:underline">
                Rapamycin for Dogs in 2026: What Every Senior Dog Owner Should Know
              </Link>
            </li>
            <li>
              <Link href="/longevity-drugs" className="text-emerald-700 hover:underline">
                Longevity drug hub (LOY-002, eligibility, timelines)
              </Link>
            </li>
          </ul>
        </section>

        <BlogBottomCTA slug={SLUG} />
      </main>
      <SiteFooter />
    </div>
  );
}
