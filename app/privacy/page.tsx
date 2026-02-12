import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | FursBliss",
  description:
    "Read how FursBliss collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 md:py-14">
        <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: February 12, 2026
        </p>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-2xl text-foreground">What we collect</h2>
          <p>
            We collect account details (name, email), pet profile data, logs,
            and optional submissions like quiz responses and waitlist signups.
          </p>
          <p>
            Payment processing is handled by Stripe. FursBliss does not store
            full card numbers.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-2xl text-foreground">How we use data</h2>
          <p>
            We use your data to provide dashboards, recommendations, reminders,
            reports, and product updates. We may send transactional emails and,
            if opted in, educational marketing emails.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-2xl text-foreground">Sharing and security</h2>
          <p>
            We share data only with service providers needed to operate the
            platform (for example hosting, email, analytics, and payments).
          </p>
          <p>
            We use reasonable technical safeguards to protect personal data.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-2xl text-foreground">Contact</h2>
          <p>
            Questions about privacy can be sent to support@fursbliss.com.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

