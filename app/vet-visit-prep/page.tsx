import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Vet Visit Prep — Symptom Timeline & Questions | FursBliss",
  description:
    "Prepare for a vet visit with a clean symptom timeline, medication list, vaccine context, and the questions you do not want to forget.",
  alternates: { canonical: "/vet-visit-prep" },
  openGraph: {
    title: "Vet Visit Prep | FursBliss",
    description:
      "Bring a clearer timeline, medication list, and symptom notes to your next appointment.",
    url: "/vet-visit-prep",
    type: "website",
    images: ["/og-default.jpg"],
  },
};

const prepBlocks = [
  {
    title: "What changed",
    text: "Track onset, frequency, appetite, stool, energy, breathing, and photos so your vet sees the pattern.",
  },
  {
    title: "What your dog takes",
    text: "Keep medications, supplements, doses, and missed doses together instead of searching messages at the clinic.",
  },
  {
    title: "What to ask",
    text: "Save questions about warning signs, follow-up timing, tests, diet changes, and when to seek urgent care.",
  },
];

export default function VetVisitPrepPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Vet-ready notes</p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            Walk into the vet visit with the timeline already organized
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            FursBliss helps you turn scattered observations into a concise visit brief: symptoms, dates, meds,
            photos, and questions in one place.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="min-h-12">
              <Link href="/signup">Create a vet-ready record</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-12">
              <Link href="/symptoms">Browse symptom guides</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {prepBlocks.map((block) => (
            <article key={block.title} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-xl tracking-tight text-foreground">{block.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{block.text}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-muted/40 p-6 md:p-8">
          <h2 className="font-display text-2xl tracking-tight text-foreground">Especially useful for senior dogs</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Senior dogs often have overlapping medications, subtle appetite changes, and recurring mobility or
            respiratory notes. A clean visit prep flow reduces guessing and makes follow-up care easier at home.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
