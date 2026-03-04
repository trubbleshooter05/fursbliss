import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { symptomPageMap, symptomPages, type SymptomUrgencyLevel } from "@/lib/symptom-pages";

type SymptomPageProps = {
  params: Promise<{ slug: string }>;
};

const urgencyStyles: Record<SymptomUrgencyLevel, string> = {
  red: "border-l-4 border-l-rose-500 bg-rose-50",
  orange: "border-l-4 border-l-orange-500 bg-orange-50",
  yellow: "border-l-4 border-l-yellow-500 bg-yellow-50",
  green: "border-l-4 border-l-emerald-500 bg-emerald-50",
};

export function generateStaticParams() {
  return symptomPages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: SymptomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = symptomPageMap[slug];
  if (!page) return {};

  const title = `${page.symptomQuestion} | When to Go to the Vet | FursBliss`;
  const description = `${page.metaBrief} Use our free 60-second triage tool to check if your dog needs emergency care, a vet visit, or home monitoring.`;

  return {
    title,
    description,
    alternates: { canonical: `/symptoms/${slug}` },
    openGraph: {
      title,
      description,
      url: `/symptoms/${slug}`,
      type: "article",
      images: ["/og-default.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.jpg"],
    },
  };
}

export default async function SymptomDetailPage({ params }: SymptomPageProps) {
  const { slug } = await params;
  const page = symptomPageMap[slug];
  if (!page) notFound();

  const relatedPages = page.relatedSlugs.map((relatedSlug) => symptomPageMap[relatedSlug]).filter(Boolean);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  const medicalJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: page.h1,
    url: `https://www.fursbliss.com/symptoms/${page.slug}`,
    about: {
      "@type": "MedicalCondition",
      name: page.symptomQuestion,
    },
    description: `${page.metaBrief} Use our free 60-second triage tool to check urgency.`,
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalJsonLd) }} />

        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Dog symptom guide</p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">{page.h1}</h1>
        </section>

        <Card className={`rounded-2xl border border-border ${urgencyStyles[page.urgencyLevel]}`}>
          <CardHeader>
            <CardTitle className="text-2xl">Quick Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground">{page.quickAnswer}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">
              {page.urgencyLabel}
            </p>
            <Button asChild className="h-auto min-h-12 whitespace-normal px-4 py-3 text-left leading-snug">
              <Link href={`/triage?symptom=${encodeURIComponent(page.symptomParam)}`}>
                Get a personalized assessment → Free Dog Triage Tool
              </Link>
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-3xl tracking-[-0.02em] text-foreground">What this symptom can mean</h2>
          {page.intro.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
              {paragraph}
            </p>
          ))}
          <p className="text-sm leading-7 text-muted-foreground">
            Use this page as a fast decision guide, not a diagnosis. A symptom can look mild early and
            become urgent later, especially overnight. The safest approach is to combine your dog&apos;s
            symptom details with behavior, breathing, hydration, and gum color. If multiple warning signs
            appear together, urgency rises quickly.
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            If you are unsure, choose the safer option and run triage now. The goal is to avoid missing
            emergencies while also reducing unnecessary panic trips. Taking two minutes to assess timing,
            progression, and red flags gives your veterinary team better information and helps you act with
            confidence.
          </p>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Common causes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {page.commonCauses.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">When it IS an emergency</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {page.emergencyRedFlags.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">When it may be okay to wait briefly</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {page.canWaitSignals.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">What you can do at home while monitoring</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {page.homeCare.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>

        <Card className="rounded-2xl border-primary/30 bg-primary/10">
          <CardContent className="space-y-3 p-6">
            <h2 className="font-display text-2xl tracking-[-0.02em] text-foreground">Check Your Dog Now</h2>
            <p className="text-sm text-muted-foreground">
              Get a fast urgency recommendation based on your dog&apos;s exact symptoms.
            </p>
            <Button asChild className="min-h-12">
              <Link href={`/triage?symptom=${encodeURIComponent(page.symptomParam)}`}>
                Start Free Triage Now →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl tracking-[-0.02em] text-foreground">Related Symptoms</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {relatedPages.map((relatedPage) => (
              <Link
                key={relatedPage.slug}
                href={`/symptoms/${relatedPage.slug}`}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground transition hover:border-primary"
              >
                {relatedPage.h1}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl tracking-[-0.02em] text-foreground">FAQ</h2>
          <div className="space-y-4">
            {page.faq.map((item) => (
              <div key={item.question}>
                <p className="text-sm font-semibold text-foreground">{item.question}</p>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="rounded-2xl border-border bg-muted/30">
          <CardContent className="space-y-3 p-6">
            <p className="text-sm font-semibold text-foreground">
              Is your dog ready for the new FDA longevity drug? Take the free 2-minute quiz →
            </p>
            <Button asChild className="min-h-12">
              <Link href="/quiz">Take the free 2-minute quiz →</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs leading-6 text-muted-foreground">
          This information is for educational purposes only and is not a substitute for professional
          veterinary care. If you believe your dog is in immediate danger, contact your nearest emergency
          veterinary hospital.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
