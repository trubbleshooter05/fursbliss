import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { DoseTracker } from "@/components/doses/dose-tracker";
import { AnimateIn } from "@/components/ui/animate-in";

export const metadata: Metadata = {
  title: "Dosing Reminders | FursBliss",
  description:
    "Track supplement dosing schedules, log adherence, and build consistency with daily reminders.",
};

export default async function DashboardDosesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const [pets, user, schedules] = await Promise.all([
    prisma.pet.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionEndsAt: true,
      },
    }),
    prisma.doseSchedule.findMany({
      where: { pet: { userId }, active: true },
      include: { pet: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const premium = user ? isSubscriptionActive(user) : false;

  return (
    <div className="space-y-6">
      <AnimateIn className="space-y-2">
        <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground">
          Dosing Reminders
        </h1>
        <p className="text-muted-foreground">
          Stay consistent with supplement schedules and daily adherence logs.
        </p>
      </AnimateIn>

      <AnimateIn delay={0.08}>
        <DoseTracker initialItems={schedules} pets={pets} isPremium={premium} />
      </AnimateIn>
    </div>
  );
}

