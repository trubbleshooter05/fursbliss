import { amazonSearchUrl, PARTNER_LINKS, SENIOR_DOG_PRODUCTS } from "@/lib/affiliate-links";

export function AffiliateNextSteps({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Recommended next steps
      </p>
      <div className="mt-3 space-y-2">
        <a
          href={PARTNER_LINKS.trupanion}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-emerald-600/40 hover:bg-emerald-50/50"
        >
          <span>Protect against unexpected vet bills</span>
          <span className="text-xs text-muted-foreground">Trupanion →</span>
        </a>
        <a
          href={PARTNER_LINKS.pawp}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-emerald-600/40 hover:bg-emerald-50/50"
        >
          <span>Talk to a vet online right now</span>
          <span className="text-xs text-muted-foreground">Pawp →</span>
        </a>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Affiliate links — FursBliss may earn a commission at no extra cost to you.
      </p>
    </div>
  );
}

export function SymptomAffiliatePicks({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Helpful for senior dogs
      </p>
      <ul className="mt-3 space-y-2">
        {SENIOR_DOG_PRODUCTS.map((item) => (
          <li key={item.query}>
            <a
              href={amazonSearchUrl(item.query)}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
