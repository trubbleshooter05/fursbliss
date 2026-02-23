import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";

const SHARE_IMAGE_URL = "/opengraph-image";
const PUBLISHED_AT = "2026-02-08T00:00:00.000Z";
const UPDATED_AT = "2026-02-08T00:00:00.000Z";

export const metadata: Metadata = {
  title: "How to Spot Fake Dog Health Advice on Social Media | FursBliss Blog",
  description:
    "Learn a practical checklist for spotting fake dog health claims, including viral supplement scams, and use safer evidence-based checks.",
  alternates: {
    canonical: "/blog/how-to-spot-fake-dog-health-advice-social-media",
  },
  openGraph: {
    title: "How to Spot Fake Dog Health Advice on Social Media | FursBliss Blog",
    description:
      "A fast checklist to filter hype from evidence in viral dog-health posts.",
    url: "/blog/how-to-spot-fake-dog-health-advice-social-media",
    type: "article",
    images: [SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Spot Fake Dog Health Advice on Social Media | FursBliss Blog",
    description:
      "Learn a practical checklist for spotting fake dog health claims, including viral supplement scams, and use safer evidence-based checks.",
    images: [SHARE_IMAGE_URL],
  },
};

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Spot Fake Dog Health Advice on Social Media",
  description:
    "Learn a practical checklist for spotting fake dog health claims, including viral supplement scams, and use safer evidence-based checks.",
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
  mainEntityOfPage: "https://www.fursbliss.com/blog/how-to-spot-fake-dog-health-advice-social-media",
};

const warningSigns = [
  "Guarantees like 'cures cancer' or 'works for every dog'",
  "No dose, no contraindications, and no safety notes",
  "Only affiliate links, no primary sources or trial details",
  "Before/after stories presented as proof",
  "Urgency pressure: 'buy now before this gets banned'",
];

export default function FakeAdvicePostPage() {
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
        <article className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Feb 8, 2026 · Consumer safety
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            How to Spot Fake Dog Health Advice on Social Media
          </h1>
          <p className="text-muted-foreground">
            Viral dog-health content can be useful, but scam patterns are increasing,
            including mushroom-supplement claims that spread faster than evidence.
            The goal is simple: slow down, verify, and protect your dog from
            high-confidence misinformation.
          </p>

          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Five red flags to check in under 30 seconds
              </p>
              <ul className="space-y-2">
                {warningSigns.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <section className="space-y-3 text-sm text-muted-foreground">
            <h2 className="font-display text-3xl text-foreground">
              A safer decision framework
            </h2>
            <p>
              Treat social posts as leads, not medical instructions. If a claim
              sounds strong, check mechanism, expected effect size, risk profile,
              and whether your dog's age, diagnosis, and medications change the
              recommendation.
            </p>
            <p>
              On FursBliss, the practical alternative is to run supplements through
              the interaction checker before adding anything new. It helps flag
              questionable combinations and gives you cleaner notes to review with
              your veterinarian.
            </p>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/interaction-checker"
              className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]"
            >
              Open supplement checker
            </Link>
            <Link
              href="/quiz"
              className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Take the longevity quiz
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            FursBliss does not diagnose or prescribe treatment. Always confirm
            supplement decisions with your veterinarian.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
