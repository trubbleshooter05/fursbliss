import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { InlineEmailCapture } from "@/components/blog/inline-email-capture";
import { BlogBottomCTA } from "@/components/blog/blog-bottom-cta";

const SHARE_IMAGE_URL = "/opengraph-image";
const SLUG = "loy-002-tas-wave-manufacturing-next-step";
const PUBLISHED_AT = "2026-04-11T00:00:00.000Z";
const UPDATED_AT = "2026-04-11T00:00:00.000Z";

export const metadata: Metadata = {
  title: "LOY-002 TAS Accepted: Media Wave, Manufacturing Still Pending | FursBliss",
  description:
    "LOY-002’s Target Animal Safety (TAS) section is FDA-accepted—two of three technical sections done. Why the story is everywhere, what manufacturing (CMC) still gates, and how to get “approval-ready” at home.",
  keywords: [
    "LOY-002 FDA",
    "LOY-002 Target Animal Safety",
    "LOY-002 manufacturing",
    "Loyal LOY-002",
    "dog longevity drug",
    "senior dog health tracking",
  ],
  alternates: {
    canonical: `/blog/${SLUG}`,
  },
  openGraph: {
    title: "The LOY-002 TAS Wave: Safety Accepted, Manufacturing Still the Gate",
    description:
      "Trade press, tech, and culture outlets are all talking about LOY-002’s FDA safety milestone. Here’s the sober split: what’s done, what isn’t, and how to prepare while CMC is still ahead.",
    url: `/blog/${SLUG}`,
    type: "article",
    images: [SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "The LOY-002 TAS Wave: Safety Accepted, Manufacturing Still the Gate",
    description:
      "Two of three FDA technical sections are in for LOY-002. Manufacturing review is still the last major hurdle—here’s what that means for senior dog families.",
    images: [SHARE_IMAGE_URL],
  },
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "The LOY-002 TAS Wave: Why the Story Exploded—and Why Manufacturing Still Comes Next",
  description:
    "Analysis of LOY-002’s FDA Target Animal Safety acceptance, remaining Chemistry Manufacturing and Controls work, and practical readiness steps for senior dog owners.",
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

export default function Loy002TasWavePostPage() {
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
            Blog · April 11, 2026
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            The LOY-002 TAS wave: why the story is everywhere—and why manufacturing still gates the
            finish line
          </h1>
          <p className="text-muted-foreground">
            If your feed suddenly looks like a veterinary biotech conference, you&apos;re not imagining
            it. Outlets from{" "}
            <a
              href="https://www.dvm360.com/view/lifespan-extension-drug-in-development-for-senior-dogs-reaches-a-new-milestone"
              className="text-emerald-700 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              dvm360
            </a>{" "}
            to{" "}
            <a
              href="https://www.businesswire.com/news/home/20260113476778/en/Loyal-Receives-FDA-Acceptance-of-Safety-Package-for-Senior-Dog-Lifespan-Extension-Drug"
              className="text-emerald-700 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              BusinessWire
            </a>{" "}
            (Loyal&apos;s original release) have been covering the same headline: the FDA accepted
            LOY-002&apos;s{" "}
            <strong className="text-foreground">Target Animal Safety (TAS)</strong> technical section.
            The same update has been bouncing through general-audience feeds too—tech and culture
            corners included (you may have seen it surface via outlets like{" "}
            <strong className="text-foreground">TechFixated</strong> or{" "}
            <strong className="text-foreground">My Modern Met</strong>)—because a longevity drug for
            senior dogs is a rare overlap of science, emotion, and news value.
          </p>
          <p className="text-muted-foreground">
            That attention is deserved. It is also easy to compress into something it isn&apos;t:{" "}
            <strong className="text-foreground">“it’s basically approved.”</strong> It isn&apos;t. The
            milestone is real; the remaining gate is also real—and it&apos;s manufacturing.
          </p>
        </div>

        <Card className="mt-8 rounded-2xl border-border bg-card">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Note:</strong> This article is for informational
              purposes only and is not veterinary advice. Regulatory timelines are based on public
              disclosures; nothing here is a promise of approval timing. FursBliss is not affiliated
              with Loyal.
            </p>
          </CardContent>
        </Card>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">What actually changed at the FDA</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Under the FDA&apos;s Expanded Conditional Approval pathway, Loyal&apos;s application is
              organized into major technical sections.{" "}
              <strong className="text-foreground">TAS acceptance</strong> means the agency has taken the
              formal safety package for review and reached the regulatory milestone of accepting that
              section—i.e., the “safety chapter” is no longer the open question it once was.
            </p>
            <p>
              Loyal publicly announced the TAS acceptance in January 2026, alongside context on what was
              inside the package: dose-ranging work, field experience from the STAY study, and data
              relevant to dogs with the messy comorbidities real senior dogs have.
            </p>
            <p>
              In plain terms: <strong className="text-foreground">effectiveness and safety have now both</strong>{" "}
              cleared the “technical section accepted” bar in Loyal&apos;s public roadmap. That leaves one
              major bucket still ahead.
            </p>
          </div>
        </section>

        <InlineEmailCapture slug={SLUG} />

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            Manufacturing (CMC) is still the last big regulatory lift
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The remaining section is{" "}
              <strong className="text-foreground">Chemistry, Manufacturing, and Controls (CMC)</strong>—proof
              that the product can be made consistently, to spec, at scale, with stability and quality
              systems that satisfy FDA expectations. This is not a comment on whether the idea works; it
              is the part of drug development that turns a program into a repeatable supply chain.
            </p>
            <p>
              Loyal has previously guided that manufacturing review activity could land in the{" "}
              <strong className="text-foreground">2027</strong> window. However the dates shake out, the
              important narrative point is structural:{" "}
              <strong className="text-foreground">
                conditional approval is not “done” until CMC is accepted too.
              </strong>
            </p>
            <p>
              So when you see the story ricochet across veterinary trade press and general-audience
              sites, the correct mental model is:{" "}
              <strong className="text-foreground">
                major scientific sections advanced; commercialization still has a manufacturing checkpoint.
              </strong>
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">Why the “wave” is happening now</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              News cycles don&apos;t always track science timelines one-to-one. A milestone that landed in
              regulatory filings can still produce a second, broader wave when it gets summarized for new
              audiences—especially when the topic is emotional (senior dogs) and historically unusual (a
              lifespan-oriented indication).
            </p>
            <p>
              That&apos;s a good thing for awareness. It also creates noise: shortened headlines,
              speculative timelines, and social clips that imply availability is imminent. The antidote is
              boring and useful:{" "}
              <strong className="text-foreground">
                anchor on what the company has actually disclosed, and what your dog needs in the
                meantime.
              </strong>
            </p>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">
            FursBliss: the LOY-002 readiness platform (before there&apos;s a pill to fill)
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              We&apos;re building FursBliss as the place senior dog families get{" "}
              <strong className="text-foreground">ready</strong>—not as a substitute for your
              veterinarian, and not as hype for a drug that isn&apos;t purchasable yet. Readiness means a
              baseline: trends you can see, visits that go better when you bring data, and fewer surprises
              when new options eventually show up in the clinic.
            </p>
            <p>What that looks like in practice:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong className="text-foreground">Track what changes gradually</strong>—mobility,
                appetite, sleep, and energy—so “slow” doesn&apos;t become “sudden” in hindsight.
              </li>
              <li>
                <strong className="text-foreground">Make vet conversations evidence-based</strong> with a
                simple history you didn&apos;t have to reconstruct from memory.
              </li>
              <li>
                <strong className="text-foreground">Stay oriented on LOY-002 reality</strong>—what&apos;s
                cleared, what&apos;s pending, and what questions are worth asking when the time comes (
                <Link href="/loy-002" className="text-emerald-700 hover:underline">
                  LOY-002 hub
                </Link>
                ).
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]"
              >
                Start free senior dog tracking →
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl text-foreground">The bottom line</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              TAS acceptance is a serious milestone—worth the headlines, worth the hope, worth the
              attention on senior dogs. Manufacturing is still the gate that turns a milestone into a
              medicine you can hold. Between now and then, the owners who will navigate this best are the
              ones who know their dog&apos;s normal—and can see drift before it becomes a crisis.
            </p>
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
              <Link href="/blog/loy-002-fda-timeline" className="text-emerald-700 hover:underline">
                LOY-002 FDA approval timeline: manufacturing and realistic dates
              </Link>
            </li>
            <li>
              <Link href="/blog/loy-002-vs-rapamycin-triad-2026-update" className="text-emerald-700 hover:underline">
                LOY-002 vs Rapamycin: two paths to dog longevity
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
