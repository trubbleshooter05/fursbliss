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
    select: { id: true, name: true },
  });

  return <AppShell user={session.user} pets={pets}>{children}</AppShell>;
}
