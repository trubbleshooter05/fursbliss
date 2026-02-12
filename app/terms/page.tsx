import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service | FursBliss",
  description: "Read the terms for using FursBliss services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 md:py-14">
        <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: February 12, 2026
        </p>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-2xl text-foreground">Use of service</h2>
          <p>
            FursBliss provides informational tools for pet health tracking and
            longevity planning. It does not replace licensed veterinary care.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-2xl text-foreground">Subscriptions and billing</h2>
          <p>
            Paid plans are billed through Stripe and renew based on your chosen
            billing cycle unless canceled.
          </p>
          <p>
            Feature availability may depend on active subscription status.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-2xl text-foreground">Liability and disclaimers</h2>
          <p>
            All recommendations and insights are informational only. Always
            consult a veterinarian before making health decisions.
          </p>
          <p>
            To the maximum extent permitted by law, FursBliss is not liable for
            indirect or consequential damages from service use.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-2xl text-foreground">Contact</h2>
          <p>Questions about these terms can be sent to support@fursbliss.com.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

