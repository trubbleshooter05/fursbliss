import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoyNotifyForm } from "@/components/longevity/loy-notify-form";

export const metadata: Metadata = {
  title: "LOY-002: The First FDA Dog Longevity Drug | FursBliss",
  description:
    "Learn LOY-002 eligibility and timeline milestones, then join for update alerts on potential FDA conditional approval and availability.",
  alternates: {
    canonical: "/loy-002",
  },
  openGraph: {
    title: "LOY-002: The First FDA Dog Longevity Drug | FursBliss",
    description:
      "Learn LOY-002 eligibility and timeline milestones, then join for update alerts on potential FDA conditional approval and availability.",
    url: "/loy-002",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOY-002: The First FDA Dog Longevity Drug | FursBliss",
    description:
      "Learn LOY-002 eligibility and timeline milestones, then join for update alerts on potential FDA conditional approval and availability.",
    images: ["/og-default.jpg"],
  },
};

export default function Loy002Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            LOY-002 overview
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            LOY-002: The First FDA Dog Longevity Drug
          </h1>
          <p className="text-muted-foreground">
            LOY-002 is a daily tablet program for senior dogs, with public updates indicating
            efficacy and safety sections accepted and manufacturing review still in progress.
            Conditional approval could potentially land in late 2026 to 2027 depending on review.
          </p>
        </section>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Who may qualify?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Senior dogs around 10+ years old</p>
            <p>- Dogs 14+ lbs</p>
            <p>- Final criteria depend on eventual FDA label language and veterinary guidance</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Get LOY-002 timeline alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Join the list to get milestone alerts and potential availability updates.</p>
            <LoyNotifyForm source="loy002" />
            <p>
              Want the full tracker?{" "}
              <Link href="/longevity-drugs" className="font-medium text-emerald-700 hover:underline">
                View the complete longevity drug hub
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
