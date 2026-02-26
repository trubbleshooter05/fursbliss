import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VaccineRecords } from "@/components/pets/vaccine-records";

type PageProps = {
  params: { id: string };
};

type VaccineMeta = {
  notes?: string;
  recordUrl?: string;
};

function parseVaccineMeta(raw: string | null) {
  if (!raw) return {} as VaccineMeta;
  try {
    return JSON.parse(raw) as VaccineMeta;
  } catch {
    return { notes: raw };
  }
}

export default async function PetVaccinesPage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, userId },
    select: { id: true, name: true },
  });
  if (!pet) {
    notFound();
  }

  const records = await prisma.medication.findMany({
    where: { petId: pet.id, reason: "vaccine_record" },
    orderBy: { startDate: "desc" },
  });

  const initialRecords = records.map((record) => {
    const meta = parseVaccineMeta(record.notes ?? null);
    return {
      id: record.id,
      vaccineName: record.name,
      administeredOn: record.startDate?.toISOString() ?? record.createdAt.toISOString(),
      nextDueOn: record.endDate?.toISOString() ?? null,
      clinic: record.prescribedBy ?? "",
      notes: meta.notes ?? "",
      recordUrl: meta.recordUrl ?? "",
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-3xl">Vaccine hub for {pet.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Store vaccine history, reminders, and links to records in one place.
        </CardContent>
      </Card>

      <VaccineRecords petId={pet.id} initialRecords={initialRecords} />
    </div>
  );
}
