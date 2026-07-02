import Link from "next/link";
import { ChevronRight, Clock, ShieldCheck, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";

type CheckSymptomsPromoProps = {
  /** hero = right-column card on homepage; banner = full-width strip; compact = inline row */
  variant?: "hero" | "banner" | "compact";
  className?: string;
};

const TRUST = [
  { icon: Clock, label: "60 seconds" },
  { icon: ShieldCheck, label: "Free, no login" },
  { icon: Stethoscope, label: "ER · vet · monitor" },
] as const;

export function CheckSymptomsPromo({ variant = "banner", className }: CheckSymptomsPromoProps) {
  if (variant === "hero") {
    return (
      <Link
        href="/check"
        className={
          className ??
          "group block rounded-2xl border-2 border-amber-300/70 bg-gradient-to-br from-amber-400/25 to-amber-500/10 p-5 shadow-lg backdrop-blur-sm transition hover:border-amber-200 hover:from-amber-400/35"
        }
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-100">Start here</p>
        <p className="mt-1 font-display text-xl font-bold text-white">Free symptom check</p>
        <p className="mt-2 text-sm leading-snug text-white/90">
          Answer a few questions — get ER now, vet today, or monitor at home.
        </p>
        <p className="mt-3 inline-flex items-center text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 group-hover:decoration-white">
          Run the checker now
          <ChevronRight className="ml-0.5 h-4 w-4" aria-hidden />
        </p>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={
          className ??
          "flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        }
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Free tool</p>
          <p className="font-display text-lg font-semibold text-foreground">Not sure how urgent it is?</p>
          <p className="text-sm text-muted-foreground">60-second check — emergency, vet soon, or monitor.</p>
        </div>
        <Button asChild className="min-h-11 shrink-0 sm:min-w-[220px]" size="lg">
          <Link href="/check">
            Check symptoms now
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section
      className={
        className ??
        "rounded-3xl border-2 border-primary/35 bg-gradient-to-br from-primary/15 via-primary/8 to-emerald-500/10 px-6 py-8 md:px-10 md:py-10"
      }
      aria-labelledby="check-symptoms-promo-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Free · 60 seconds · No account</p>
          <h2 id="check-symptoms-promo-heading" className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
            Should you go to the vet right now?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Most owners land here worried about one symptom. The fastest next step is the free checker — it
            gives you a clear band (emergency, vet soon, or monitor) plus text you can copy for your clinic.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[260px]">
          <Button asChild className="min-h-12 w-full text-base shadow-md" size="lg">
            <Link href="/check">
              Check my dog&apos;s symptoms
              <ChevronRight className="ml-1 h-5 w-5" aria-hidden />
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">Not a diagnosis — call ER for breathing trouble or collapse.</p>
        </div>
      </div>
    </section>
  );
}
