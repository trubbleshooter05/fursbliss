import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MedicalDisclaimerBanner } from "@/components/emergency-symptoms/medical-disclaimer-banner";
import { SymptomMobileStickyCta } from "@/components/emergency-symptoms/symptom-mobile-sticky-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SymptomPageDefinition, QuickAnswerUrgency } from "@/lib/emergency-symptoms/types";
import { getSymptomPage } from "@/lib/emergency-symptoms/content";
import { absoluteFursblissUrl, getFursblissSiteUrl } from "@/lib/emergency-symptoms/base-url";

function urgencyLabel(u: QuickAnswerUrgency): { label: string; className: string } {
  switch (u) {
    case "emergency":
      return { label: "Emergency", className: "border-rose-200 bg-rose-50 text-rose-900" };
    case "vet-soon":
      return { label: "Vet soon", className: "border-amber-200 bg-amber-50 text-amber-950" };
    case "monitor":
      return { label: "Monitor", className: "border-sky-200 bg-sky-50 text-sky-950" };
    case "likely-non-urgent":
      return { label: "Likely non-urgent", className: "border-emerald-200 bg-emerald-50 text-emerald-950" };
    default:
      return { label: "Monitor", className: "border-border bg-muted text-foreground" };
  }
}

type Props = {
  page: SymptomPageDefinition;
  updatedIso: string;
};

export function SymptomLandingTemplate({ page, updatedIso }: Props) {
  const pageUrl = absoluteFursblissUrl(`/symptoms/${page.slug}`);
  const { label, className } = urgencyLabel(page.quickAnswer.urgency);
  const siteUrl = getFursblissSiteUrl();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const medicalJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.h1,
    description: page.metaDescription,
    inLanguage: "en-US",
    dateModified: updatedIso,
    isPartOf: {
      "@type": "WebSite",
      name: "FursBliss",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "FursBliss",
      url: siteUrl,
    },
  };

  const related = page.relatedSlugs
    .map((slug) => ({ slug, p: getSymptomPage(slug) }))
    .filter((x): x is { slug: string; p: SymptomPageDefinition } => Boolean(x.p));

  return (
    <>
      <SymptomMobileStickyCta />
      <article className="mx-auto max-w-3xl space-y-8 pb-24 md:pb-0">
        <JsonLd data={medicalJsonLd} />
        <JsonLd data={faqJsonLd} />

        <h1 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {page.h1}
        </h1>

        <MedicalDisclaimerBanner variant="compact" />

        <Card className="rounded-2xl border-border">
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-foreground">Quick Answer</h2>
            <p>
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}
              >
                {label}
              </span>
            </p>
            <p className="text-sm leading-snug text-muted-foreground">{page.quickAnswer.body}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 border-primary/35 bg-primary/10 shadow-sm">
          <CardContent className="space-y-4 p-6 md:p-8">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Not sure if this is serious?
            </h2>
            <Button asChild className="min-h-12 w-full text-base sm:w-auto sm:min-w-[280px]" size="lg">
              <Link href="/check">Check your dog&apos;s symptoms now</Link>
            </Button>
          </CardContent>
        </Card>

        <section className="rounded-2xl border border-rose-200/90 bg-rose-50/60 p-4 md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-rose-800">Emergency — act on these</p>
          <h2 className="font-display mt-2 text-2xl text-foreground">When to go to the vet now</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-snug text-muted-foreground">
            {page.vetNowBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground">Common reasons this happens</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-snug text-muted-foreground">
            {page.commonReasons.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-4 md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-900">If none of the emergency signs fit</p>
          <h2 className="font-display mt-2 text-2xl text-foreground">What to do next</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-snug text-muted-foreground">
            {page.nextSteps.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <Card className="rounded-2xl border border-border bg-muted/40">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Match this page to your dog</h2>
            <p className="text-sm leading-snug text-muted-foreground">
              The checker asks about timing, severity, and red flags—then suggests emergency, vet soon, or monitor.
            </p>
            <Button asChild className="min-h-12 w-full sm:w-auto">
              <Link href="/check">Check your dog&apos;s symptoms now</Link>
            </Button>
          </CardContent>
        </Card>

        <section>
          <h2 className="font-display text-2xl text-foreground">FAQ</h2>
          <dl className="mt-4 space-y-6 text-sm text-muted-foreground">
            {page.faqs.map((f) => (
              <div key={f.question}>
                <dt className="font-semibold text-foreground">{f.question}</dt>
                <dd className="mt-2 leading-snug">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="font-display text-2xl text-foreground">Related symptom guides</h2>
          <p className="mt-2 text-sm leading-snug text-muted-foreground">
            Same topic cluster: jump to overlapping signs, then the hub or checker when you need a fast decision.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {related.map(({ slug, p }) => (
              <li key={slug}>
                <Link href={`/symptoms/${slug}`} className="font-medium text-emerald-700 hover:underline">
                  {p.h1}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-border">
              <Link href="/symptoms" className="font-medium text-emerald-700 hover:underline">
                All dog symptom guides (hub)
              </Link>
            </li>
            <li>
              <Link href="/check" className="font-semibold text-emerald-800 hover:underline">
                Free symptom checker — 60 seconds, no login
              </Link>
            </li>
          </ul>
        </section>

        <Card className="rounded-2xl border-2 border-primary/40 bg-primary/10 shadow-sm">
          <CardContent className="space-y-4 p-6 md:p-8">
            <p className="font-display text-lg font-bold text-foreground md:text-xl">
              Still deciding? Run the checker—emergency, vet soon, or monitor, plus text for your clinic.
            </p>
            <Button asChild className="min-h-12 w-full text-base sm:w-auto" size="lg">
              <Link href="/check">Go to symptom checker</Link>
            </Button>
          </CardContent>
        </Card>
      </article>
    </>
  );
}
