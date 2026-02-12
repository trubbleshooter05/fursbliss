import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnimateIn } from "@/components/ui/animate-in";
import { InteractionCheckerWorkbench } from "@/components/interaction/interaction-checker-workbench";

export const metadata: Metadata = {
  title: "Supplement Interaction Checker | FursBliss",
  description:
    "Run AI-assisted supplement interaction checks for your dog's current stack and review SAFE/CAUTION/AVOID guidance.",
};

export default async function InteractionCheckerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const pets = await prisma.pet.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      breed: true,
      age: true,
      weight: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <AnimateIn className="rounded-3xl border border-border bg-[var(--color-section-dark)] p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Premium medical intelligence
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">
          Supplement Interaction Checker
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-white/80">
          Review potential interactions, dosage concerns, and red flags with a
          structured SAFE / CAUTION / AVOID result set. Always confirm changes
          with your veterinarian.
        </p>
      </AnimateIn>
      <AnimateIn delay={0.08}>
        <InteractionCheckerWorkbench pets={pets} />
      </AnimateIn>
    </div>
  );
}
