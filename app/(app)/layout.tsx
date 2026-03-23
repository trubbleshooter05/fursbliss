import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/dashboard/app-shell";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const pets = await prisma.pet.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, healthLogs: { take: 1 } },
  });

  const firstPetNoLogs =
    pets.length === 1 && pets[0].healthLogs.length === 0;
  if (firstPetNoLogs) {
    redirect(`/onboarding/first-log?petId=${pets[0].id}`);
  }

  const petsForShell = pets.map(({ healthLogs: _, ...p }) => p);

  const unreadUrgentAlerts = await prisma.healthAlert.count({
    where: {
      userId: session.user.id,
      read: false,
      severity: { in: ["warning", "urgent"] },
    },
  });

  return (
    <AppShell user={session.user} pets={petsForShell} unreadUrgentAlerts={unreadUrgentAlerts}>
      {children}
    </AppShell>
  );
}
