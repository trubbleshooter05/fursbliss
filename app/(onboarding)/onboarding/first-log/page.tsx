import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FirstLogOnboarding } from "@/components/onboarding/first-log-onboarding";

type Props = {
  searchParams: Promise<{ petId?: string }>;
};

export default async function FirstLogPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { petId } = await searchParams;
  if (!petId) redirect("/dashboard");

  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: session.user.id },
    select: { id: true, name: true, photoUrl: true },
  });
  if (!pet) redirect("/dashboard");

  const logCount = await prisma.healthLog.count({
    where: { petId: pet.id },
  });
  if (logCount > 0) redirect("/dashboard");

  return (
    <div className="w-full max-w-xl mx-auto">
      <FirstLogOnboarding pet={pet} />
    </div>
  );
}
