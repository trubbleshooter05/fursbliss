import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimateIn } from "@/components/ui/animate-in";
import { LoyWaitlistCta } from "@/components/loy-waitlist/loy-waitlist-cta";

const SHARE_IMAGE_URL = "/og-default.jpg";
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is LOY-002?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LOY-002 is a dog longevity candidate being developed as a daily pill focused on metabolic aging pathways in senior dogs.",
      },
    },
    {
      "@type": "Question",
      name: "When could LOY-002 become available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Public guidance currently points to a potential conditional approval window in late 2026 or early 2027, pending FDA review milestones.",
      },
    },
    {
      "@type": "Question",
      name: "How can I know if my dog may be eligible?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FursBliss provides a quick readiness check and waitlist flow using publicly shared study criteria, then sends launch updates as milestones are announced.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "LOY-002 Waitlist - Is Your Dog Eligible? | FursBliss",
  description:
    "Join the LOY-002 readiness waitlist. Check if your senior dog is eligible for the first FDA-backed longevity drug. Get prepared before launch day.",
  alternates: {
    canonical: "/loy-002-waitlist",
  },
  openGraph: {
    title: "LOY-002 Waitlist - Is Your Dog Eligible? | FursBliss",
    description:
      "Join the LOY-002 readiness waitlist and check if your dog may qualify. Get prepared before launch day.",
    url: "/loy-002-waitlist",
    type: "website",
    images: [
      {
        url: SHARE_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "LOY-002 waitlist and readiness checker on FursBliss",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOY-002 Waitlist - Is Your Dog Eligible? | FursBliss",
    description:
      "Check LOY-002 eligibility and join the waitlist for launch milestones, readiness guidance, and next steps for your dog.",
    images: [SHARE_IMAGE_URL],
  },
};

export default function LoyWaitlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <section className="space-y-8 rounded-3xl border border-border bg-card px-5 py-8 md:px-8 md:py-10">
          <AnimateIn className="space-y-4">
            <Badge className="w-fit bg-emerald-500/10 text-emerald-700">
              LOY-002 Waitlist
            </Badge>
            <h1 className="max-w-4xl font-display text-4xl tracking-[-0.03em] text-foreground md:text-6xl">
              Be First in Line When LOY-002 Launches
            </h1>
            <p className="max-w-4xl text-muted-foreground">
              LOY-002 is a $250M-backed longevity drug program for senior dogs
              approaching FDA conditional approval in late 2026 or early 2027.
              Two of three FDA requirements are completed, with manufacturing
              submission in progress.
            </p>
          </AnimateIn>

          <AnimateIn delay={0.08} className="space-y-3">
            <h2 className="font-display text-3xl tracking-[-0.02em] text-foreground">
              Quick eligibility check
            </h2>
            <p className="text-sm text-muted-foreground">
              Get an instant indication based on public LOY-002 study criteria,
              then join the readiness list.
            </p>
            <LoyWaitlistCta />
          </AnimateIn>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <AnimateIn>
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="font-display text-2xl">What is LOY-002?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  LOY-002 is being developed as a daily pill that targets metabolic
                  aging pathways in senior dogs.
                </p>
                <p>
                  Current public target profile: dogs 10+ years old and 14+ lbs.
                </p>
              </CardContent>
            </Card>
          </AnimateIn>

          <AnimateIn delay={0.08}>
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="font-display text-2xl">FDA timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>- RXE accepted</p>
                <p>- TAS accepted</p>
                <p>- Manufacturing submission in progress</p>
                <p>- Conditional approval possible late 2026 / early 2027</p>
              </CardContent>
            </Card>
          </AnimateIn>

          <AnimateIn delay={0.12}>
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="font-display text-2xl">STAY clinical study</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>- 1,300 dogs enrolled</p>
                <p>- 70 clinics participating</p>
                <p>- ~4-year study design</p>
              </CardContent>
            </Card>
          </AnimateIn>

          <AnimateIn delay={0.16}>
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="font-display text-2xl">How to prepare your dog</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  -{" "}
                  <Link href="/quiz" className="font-medium text-emerald-700 hover:underline">
                    Take the longevity quiz
                  </Link>
                </p>
                <p>
                  -{" "}
                  <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
                    Start daily health tracking
                  </Link>
                </p>
                <p>
                  -{" "}
                  <Link
                    href="/quiz"
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    Download your Longevity Readiness Report
                  </Link>
                </p>
              </CardContent>
            </Card>
          </AnimateIn>
        </section>

        <AnimateIn delay={0.22}>
          <section className="mt-10 rounded-2xl border border-border bg-card px-5 py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">Explore more on FursBliss</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link href="/">Homepage</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/blog">Blog</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/longevity-drugs">Drug Hub</Link>
                </Button>
              </div>
            </div>
          </section>
        </AnimateIn>
      </main>
      <SiteFooter />
    </div>
  );
}
