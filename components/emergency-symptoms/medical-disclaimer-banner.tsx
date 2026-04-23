import Link from "next/link";

type Props = {
  variant?: "default" | "compact";
};

/** Visible informational disclaimer — not veterinary diagnosis or emergency care. */
export function MedicalDisclaimerBanner({ variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <aside
        className="mb-6 rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950"
        role="note"
      >
        <p>
          <strong>Informational only:</strong> FursBliss does not provide veterinary diagnosis, prognosis, or
          treatment. It is not a substitute for a licensed veterinarian or emergency care.{" "}
          <Link href="/terms" className="font-medium text-emerald-800 underline underline-offset-2">
            Terms
          </Link>
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="mb-6 rounded-xl border border-amber-500/50 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      role="note"
    >
      <p className="font-semibold text-amber-950">Informational only — not a substitute for veterinary care</p>
      <p className="mt-2 leading-relaxed text-amber-950/95">
        FursBliss provides general educational information and triage-style prompts to help you notice urgency and
        prepare for a conversation with a veterinarian. It does not diagnose conditions, predict outcomes, replace
        an exam, or replace your veterinarian. For diagnosis, treatment, prescription decisions, and emergencies,
        contact a qualified veterinarian or emergency clinic.
      </p>
    </aside>
  );
}
