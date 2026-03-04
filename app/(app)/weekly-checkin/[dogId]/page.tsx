import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WeeklyCheckInForm } from "@/components/weekly-checkin/weekly-checkin-form";

type PageProps = {
  params: { dogId: string };
};

export default async function WeeklyCheckInPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: params.dogId,
      userId: session.user.id,
    },
  });

  if (!pet) {
    return notFound();
  }

  // Calculate week start date (last Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = Sunday
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToMonday);
  lastMonday.setHours(0, 0, 0, 0);

  // Calculate week number (weeks since pet was added)
  const weeksSincePetAdded = Math.floor(
    (now.getTime() - pet.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const weekNumber = weeksSincePetAdded + 1;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <WeeklyCheckInForm
        petId={pet.id}
        petName={pet.name}
        dogBreed={pet.breed}
        weekStartDate={lastMonday.toISOString()}
        weekNumber={weekNumber}
      />
    </div>
  );
}
