import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ErTriageWorkbench } from "@/components/triage/er-triage-workbench";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pet ER Triage Assistant | FursBliss",
  description:
    "Run AI-assisted symptom triage to help decide if your dog needs emergency, same-day, or scheduled vet care.",
  robots: {
    index: false,
    follow: false,
  },
};

type TriagePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TriagePage({ searchParams }: TriagePageProps) {
  const params = (await searchParams) ?? {};
  const symptomParam = Array.isArray(params.symptom) ? params.symptom[0] : params.symptom;
  const initialSymptom = typeof symptomParam === "string" ? symptomParam.replaceAll("-", " ") : "";
  const checkoutParam = Array.isArray(params.checkout) ? params.checkout[0] : params.checkout;
  const upgradedParam = Array.isArray(params.upgraded) ? params.upgraded[0] : params.upgraded;
  const checkoutSuccess = checkoutParam === "success" || upgradedParam === "true";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-3xl border border-border bg-[var(--color-section-dark)] p-6 text-white md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Safety-first triage</p>
          <h1 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">Pet ER Triage Assistant</h1>
          <p className="mt-3 max-w-3xl text-sm text-white/80">
            Enter symptoms to get a fast urgency recommendation before heading to ER. No login required for
            free triage.
          </p>
        </section>
        <ErTriageWorkbench
          pets={[]}
          initialSymptom={initialSymptom}
          checkoutSuccess={checkoutSuccess}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
