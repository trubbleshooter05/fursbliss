import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ErTriageWorkbench } from "@/components/triage/er-triage-workbench";
import { AnimateIn } from "@/components/ui/animate-in";

export const metadata: Metadata = {
  title: "Pet ER Triage Assistant | FursBliss",
  description:
    "Run AI-assisted symptom triage to help decide if your dog needs emergency, same-day, or scheduled vet care.",
};

export default async function TriagePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const pets = await prisma.pet.findMany({
    where: { userId },
    select: { id: true, name: true, breed: true, age: true, weight: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <AnimateIn className="rounded-3xl border border-border bg-[var(--color-section-dark)] p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Safety-first triage
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">
          Pet ER Triage Assistant
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-white/80">
          Enter symptoms to get a structured urgency recommendation before heading to ER. Premium unlocks full triage reporting and vet-prep guidance.
        </p>
      </AnimateIn>
      <AnimateIn delay={0.08}>
        <ErTriageWorkbench
          pets={pets}
          isPremium={session.user.subscriptionStatus === "premium"}
        />
      </AnimateIn>
    </div>
  );
}
