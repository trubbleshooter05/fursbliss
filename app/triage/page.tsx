import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ErTriageWorkbench } from "@/components/triage/er-triage-workbench";

export const revalidate = 3600;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I know if my dog needs emergency vet care?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Take your dog to an emergency vet immediately for: difficulty breathing, collapse or inability to stand, seizures, suspected poisoning, severe trauma (hit by car, bite wound), bloated or painful abdomen, pale or blue gums, or uncontrolled bleeding. When in doubt, call an emergency vet.",
      },
    },
    {
      "@type": "Question",
      name: "Is this triage tool a replacement for a vet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This tool helps you assess urgency to decide whether to seek emergency care now, schedule a same-day vet visit, or safely monitor at home. Only a licensed veterinarian who examines your pet can provide a diagnosis.",
      },
    },
    {
      "@type": "Question",
      name: "How much does an emergency vet visit cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Emergency vet visits typically cost $800–$1,500 for the initial visit, not including treatment. Many visits are for non-emergencies that could have been safely monitored at home. This triage tool helps you avoid unnecessary emergency visits while never missing a true emergency.",
      },
    },
    {
      "@type": "Question",
      name: "What symptoms always require emergency vet care?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Always go to emergency vet for: breathing difficulty, collapse, seizures, suspected poisoning, uncontrolled bleeding, severe trauma, pale/blue/white gums, bloated or rock-hard abdomen, cannot urinate (especially male cats), or extreme pain.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Free Dog ER Triage Tool — Should I Go to the Emergency Vet? | FursBliss",
  description:
    "Enter your dog's symptoms and get an instant triage recommendation — emergency, same-day, or monitor at home. Free AI-assisted triage tool.",
  alternates: { canonical: "https://www.fursbliss.com/triage" },
  openGraph: {
    title: "Free Dog ER Triage Tool | FursBliss",
    description: "Get an instant recommendation: emergency vet, same-day, or home care. Free and no login required.",
    url: "https://www.fursbliss.com/triage",
    type: "website",
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
  const urgentParam = Array.isArray(params.urgent) ? params.urgent[0] : params.urgent;
  const sessionParam = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;
  const urgentReady = urgentParam === "ready";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
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
          urgentReady={urgentReady}
          checkoutSessionId={typeof sessionParam === "string" ? sessionParam : undefined}
        />
        <section className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Related free tools</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/check" className="font-medium text-emerald-700 hover:underline">
                Quick dog symptom checker (60 seconds)
              </Link>
            </li>
            <li>
              <Link href="/er-triage-for-dogs" className="font-medium text-emerald-700 hover:underline">
                When to go to the emergency vet
              </Link>
            </li>
            <li>
              <Link href="/symptoms" className="font-medium text-emerald-700 hover:underline">
                Browse symptom guides
              </Link>
            </li>
            <li>
              <Link href="/vet-visit-prep" className="font-medium text-emerald-700 hover:underline">
                Vet visit prep checklist
              </Link>
            </li>
            <li>
              <Link href="/daily-care-plan" className="font-medium text-emerald-700 hover:underline">
                Daily care plan for senior dogs
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
