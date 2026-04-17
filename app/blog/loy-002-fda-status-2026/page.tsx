import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { InlineEmailCapture } from "@/components/blog/inline-email-capture";
import { BlogBottomCTA } from "@/components/blog/blog-bottom-cta";

const SHARE_IMAGE_URL = "/opengraph-image";
const SLUG = "loy-002-fda-status-2026";
const PUBLISHED_AT = "2026-04-12T00:00:00.000Z";
const UPDATED_AT = "2026-04-12T00:00:00.000Z";

export const metadata: Metadata = {
  title: "LOY-002 FDA Status (2026 Update): What Dog Owners Should Know | FursBliss",
  description:
    "LOY-002 FDA status in 2026: what is publicly known about the conditional approval pathway, which technical sections are accepted, what is still pending, and how to think about timing—without treating estimates as guarantees.",
  keywords: [
    "LOY-002 FDA status 2026",
    "LOY-002 FDA",
    "LOY-002 approval",
    "Loyal LOY-002",
    "dog longevity drug FDA",
  ],
  alternates: {
    canonical: `/blog/${SLUG}`,
  },
  openGraph: {
    title: "LOY-002 FDA Status (2026 Update): What Dog Owners Should Know",
    description:
      "Factual snapshot of LOY-002’s FDA pathway: accepted sections, pending manufacturing (CMC) work, and clearly labeled estimates—plus what owners can do while timelines evolve.",
    url: `/blog/${SLUG}`,
    type: "article",
    images: [SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOY-002 FDA Status (2026 Update): What Dog Owners Should Know",
    description:
      "A conservative, informational overview of LOY-002’s FDA status: facts, pending steps, and labeled estimates—not predictions.",
    images: [SHARE_IMAGE_URL],
  },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is LOY-002 approved yet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As of Loyal’s public regulatory updates through early 2026, LOY-002 has not received conditional approval for marketing. The FDA has accepted two major technical sections (Reasonable Expectation of Effectiveness and Target Animal Safety) under the Expanded Conditional Approval pathway; Chemistry, Manufacturing, and Controls (CMC) was still pending in those disclosures. Conditional approval is not final until outstanding regulatory requirements are met.",
      },
    },
    {
      "@type": "Question",
      name: "When will LOY-002 be available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is no FDA-confirmed public release date. Loyal has described manufacturing (CMC) review on a timeframe that may extend into 2027, which is an estimate from the company—not a guarantee of when a product will be available or prescribed. Availability depends on future FDA decisions and company readiness.",
      },
    },
  ],
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "LOY-002 FDA Status (2026 Update): What Dog Owners Should Know",
  description:
    "Informational overview of LOY-002 FDA progress under Expanded Conditional Approval: accepted sections, pending CMC, labeled estimates, and owner takeaways. Not veterinary advice.",
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

export default function Loy002FdaStatus2026Page() {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(FAQ_JSON_LD),
          }}
        />
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Blog · Updated April 12, 2026
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            LOY-002 FDA Status (2026 Update): What Dog Owners Should Know
          </h1>
          <p className="text-muted-foreground">
            People searching &quot;LOY-002 FDA status 2026&quot; usually want one thing: a clear snapshot of
            what is publicly known today—without hype. This page summarizes{" "}
            <strong className="text-foreground">documented pathway progress</strong>, separates{" "}
            <strong className="text-foreground">facts from estimates</strong>, and points to practical next steps
            for senior dog families.
          </p>
        </div>

        <Card className="mt-8 rounded-2xl border-border bg-card">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Disclaimer:</strong> This article is for general
              informational purposes only and is <strong className="text-foreground">not veterinary advice</strong>
              . It does not diagnose conditions or tell you what to do for your dog. Always consult a licensed
              veterinarian for medical decisions and emergencies. FursBliss is not affiliated with Loyal, and we
              do not have access to non-public FDA communications.
            </p>
          </CardContent>
        </Card>

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-3xl text-foreground">What is LOY-002?</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              LOY-002 is an investigational prescription medicine in development by Loyal for{" "}
              <strong className="text-foreground">senior dogs</strong> under the FDA&apos;s{" "}
              <strong className="text-foreground">Expanded Conditional Approval (XCA)</strong> pathway for
              veterinary drugs. Public materials describe it as aimed at addressing age-related metabolic
              dysfunction—not as a guarantee of any specific outcome for an individual dog.
            </p>
            <p>
              Conditional approval (if granted in the future) would be a regulatory milestone—not the same as
              full approval under every FDA pathway. The distinction matters because conditional approval can
              include ongoing confirmatory expectations; details would be reflected in future FDA labeling and
              company communications.
            </p>
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-3xl text-foreground">Current FDA approval status (factual only)</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The statements below reflect what Loyal has publicly reported about{" "}
              <strong className="text-foreground">technical section acceptance</strong> within its conditional
              approval application—not a claim that LOY-002 is approved for sale or that any specific label claim
              is finalized.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-3 text-left font-semibold text-foreground">Technical section</th>
                  <th className="px-3 py-3 text-left font-semibold text-foreground">Public status (per Loyal)</th>
                  <th className="px-3 py-3 text-left font-semibold text-foreground">Timing referenced</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 font-medium text-foreground">
                    Reasonable Expectation of Effectiveness (RXE)
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">Accepted</td>
                  <td className="px-3 py-3 text-muted-foreground">February 2025 (public disclosure)</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3 font-medium text-foreground">Target Animal Safety (TAS)</td>
                  <td className="px-3 py-3 text-muted-foreground">Accepted</td>
                  <td className="px-3 py-3 text-muted-foreground">January 2026 (public disclosure)</td>
                </tr>
                <tr className="border-b border-border/70 last:border-b-0">
                  <td className="px-3 py-3 font-medium text-foreground">
                    Chemistry, Manufacturing, and Controls (CMC)
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">Not publicly reported as accepted</td>
                  <td className="px-3 py-3 text-muted-foreground">See estimate section below</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            If any row becomes outdated, rely on Loyal&apos;s investor updates and FDA communications—not blog
            summaries.
          </p>
        </section>

        <InlineEmailCapture slug={SLUG} />

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-3xl text-foreground">Expected timeline (estimate—not a promise)</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Label:</strong> Company estimate. Loyal has publicly discussed
              manufacturing (CMC) work on a timeline that may include review activity around{" "}
              <strong className="text-foreground">2027</strong>. That is{" "}
              <strong className="text-foreground">not</strong> an FDA-confirmed approval date, a prescription
              timeline, or a promise that LOY-002 will be available to pet owners on any specific date.
            </p>
            <p>
              Regulatory review can pause, extend, or require additional information. Treat any date you see
              online—including on social media—as unverified unless it comes from the FDA or the drug sponsor with
              enough context to understand what milestone it refers to.
            </p>
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-display text-3xl text-foreground">What it means for dog owners</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="text-foreground">Nothing here replaces your veterinarian.</strong> Decisions
                about appetite, energy, shaking, medications, or emergencies belong with a clinic that knows your
                dog.
              </li>
              <li>
                <strong className="text-foreground">Tracking helps future conversations.</strong> If you are
                preparing for a world where longevity tools exist, baseline logs for mobility, appetite, and
                symptoms still matter—whether the topic is metabolic health or something unrelated, like{" "}
                <Link href="/breeds/poodle-skin-coat" className="text-emerald-700 hover:underline">
                  skin and coat changes (itching and coat health)
                </Link>{" "}
                or{" "}
                <Link href="/symptoms/dog-eye-swollen" className="text-emerald-700 hover:underline">
                  eye redness or swelling
                </Link>{" "}
                (some causes include allergy or irritation—your vet can differentiate).
              </li>
              <li>
                <strong className="text-foreground">Use primary sources for FDA facts.</strong> For the latest
                sponsor-reported milestones, check Loyal&apos;s official announcements; for regulatory status,
                rely on FDA publications when available.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-10 space-y-4 rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="font-display text-2xl text-foreground">FAQ</h2>
          <dl className="space-y-6 text-sm text-muted-foreground">
            <div>
              <dt className="font-semibold text-foreground">Is LOY-002 approved yet?</dt>
              <dd className="mt-2">
                No conditional approval for marketing had been announced as of the public disclosures summarized
                above. Section acceptance is progress within an application; it is not the same as final
                conditional approval.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">When will LOY-002 be available?</dt>
              <dd className="mt-2">
                There is no confirmed public availability date. Future availability depends on FDA decisions and
                manufacturing readiness. Any timeframe you encounter should be treated as uncertain unless backed
                by an authoritative source in context.
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-10 space-y-4 rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Again:</strong> not veterinary advice. If your dog is ill or you
            are unsure whether something is urgent, contact your veterinarian or an emergency clinic.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm">
          <p className="font-semibold text-foreground">Related</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/blog/loy-002-fda-timeline" className="text-emerald-700 hover:underline">
                LOY-002 FDA approval timeline (manufacturing step explained)
              </Link>
            </li>
            <li>
              <Link href="/blog/loy-002-tas-wave-manufacturing-next-step" className="text-emerald-700 hover:underline">
                LOY-002 TAS milestone and manufacturing gate
              </Link>
            </li>
            <li>
              <Link href="/loy-002" className="text-emerald-700 hover:underline">
                LOY-002 hub on FursBliss
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
