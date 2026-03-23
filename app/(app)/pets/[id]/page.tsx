import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnergyTrendChart } from "@/components/dashboard/energy-trend-chart";
import { WeightTrendChart } from "@/components/pets/weight-trend-chart";
import { DeletePetDialog } from "@/components/pets/delete-pet-dialog";
import { MedicationForm } from "@/components/pets/medication-form";
import { DoseScheduleForm } from "@/components/pets/dose-schedule-form";
import { VetReportExportButton } from "@/components/pets/vet-report-export-button";
import { HealthLogHistory } from "@/components/pets/health-log-history";
import { PhotoTimeline } from "@/components/pets/photo-timeline";
import { isSubscriptionActive } from "@/lib/subscription";
import { HealthAlertsPanel } from "@/components/dashboard/health-alerts-panel";

type PetDetailPageProps = {
  params: { id: string };
  searchParams?: { compare?: string };
};

export default async function PetDetailPage({ params, searchParams }: PetDetailPageProps) {
  const { id } = params;
  const compare = searchParams?.compare;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });
  const isPremiumUser = isSubscriptionActive(userRecord ?? {});

  const pet = await prisma.pet.findFirst({
    where: { id, userId },
    include: {
      healthLogs: { orderBy: { date: "desc" }, take: 50 },
      weightLogs: { orderBy: { date: "desc" } },
      photoLogs: { orderBy: { createdAt: "desc" }, take: 6 },
      medications: { where: { active: true }, orderBy: { createdAt: "desc" } },
      doseSchedules: { where: { active: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!pet) {
    notFound();
  }

  // Fetch PetPhoto timeline data
  const [petPhotosRaw, petPhotoTotal] = await Promise.all([
    prisma.petPhoto.findMany({
      where: { petId: id, userId },
      orderBy: { takenAt: "desc" },
      take: isPremiumUser ? 200 : 3,
      select: { id: true, imageUrl: true, category: true, bodyArea: true, notes: true, takenAt: true, createdAt: true },
    }),
    prisma.petPhoto.count({ where: { petId: id, userId } }),
  ]);
  const petPhotos = petPhotosRaw.map((p) => ({
    ...p,
    takenAt: p.takenAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

  const symptoms = Array.isArray(pet.symptoms)
    ? pet.symptoms.filter((symptom): symptom is string => typeof symptom === "string")
    : [];
  const energyData = pet.healthLogs
    .slice()
    .reverse()
    .map((log) => ({
      date: format(log.date, "MMM d"),
      energy: log.energyLevel,
    }));
  const weightData = pet.weightLogs
    .slice()
    .reverse()
    .map((log) => ({
      date: format(log.date, "MMM d"),
      weight: log.weight,
    }));
  const uniqueTrackingDays = new Set(
    pet.healthLogs.map((log) => log.date.toISOString().slice(0, 10))
  ).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">{pet.name}</h1>
          <p className="text-muted-foreground">
            {pet.breed} • {pet.age} years • {pet.weight} lbs
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/logs/new?petId=${pet.id}`}>Log Health</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/insights?petId=${pet.id}`}>Get AI Recommendations</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/pets/${pet.id}/breed-risks`}>Breed Risks</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/pets/${pet.id}/interaction-check`}>
              Interaction Check
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/pets/${pet.id}/gut-health`}>Gut Health</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/pets/${pet.id}/photos`}>Photos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/pets/${pet.id}/vaccines`}>Vaccine Hub</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/pets/${pet.id}/vet-share`}>Vet Share</Link>
          </Button>
          <VetReportExportButton
            petId={pet.id}
            petName={pet.name}
            daysTracked={uniqueTrackingDays}
            isPremium={isPremiumUser}
          />
          <Button variant="secondary" asChild>
            <Link href={`/pets/${pet.id}/edit`}>Edit</Link>
          </Button>
          <MedicationForm petId={pet.id} />
          <DoseScheduleForm petId={pet.id} />
          <DeletePetDialog petId={pet.id} petName={pet.name} />
        </div>
      </div>

      <HealthAlertsPanel petId={pet.id} petName={pet.name} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Energy trend</CardTitle>
          </CardHeader>
          <CardContent>
            {energyData.length > 1 ? (
              <EnergyTrendChart data={energyData} />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                Add more health logs to see trends.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weight overview</CardTitle>
          </CardHeader>
          <CardContent>
            {weightData.length > 1 ? (
              <WeightTrendChart data={weightData} />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                Weight trends appear once you log multiple entries.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Health log history</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthLogHistory
              logs={pet.healthLogs}
              isPremium={isPremiumUser}
              petName={pet.name}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pet.photoUrl ? (
              <img
                src={pet.photoUrl}
                alt={pet.name}
                className="h-44 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-44 items-center justify-center rounded-2xl bg-slate-100 text-sm text-muted-foreground">
                Add a photo in edit mode.
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-900">Symptoms</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {symptoms.length === 0 ? (
                  <Badge variant="outline">No symptoms selected</Badge>
                ) : (
                  symptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary">
                      {symptom}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Medications</p>
              <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                {pet.medications.length === 0 ? (
                  <p>No active medications yet.</p>
                ) : (
                  pet.medications.map((medication) => (
                    <div
                      key={medication.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <p className="font-medium text-slate-900">
                        {medication.name}
                      </p>
                      <p>
                        {medication.dosage} • {medication.frequency}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Supplement schedule</p>
              <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                {pet.doseSchedules.length === 0 ? (
                  <p>No dose schedules yet.</p>
                ) : (
                  pet.doseSchedules.map((dose) => (
                    <div
                      key={dose.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <p className="font-medium text-slate-900">
                        {dose.supplementName}
                      </p>
                      <p>
                        {dose.dosage} • {dose.frequency}
                      </p>
                      {dose.daysOfWeek && (
                        <p className="text-xs text-slate-500">
                          Days: {formatDaysOfWeek(dose.daysOfWeek)}
                        </p>
                      )}
                      {dose.notes && (
                        <p className="text-xs text-slate-500">Notes: {dose.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoTimeline
            petId={pet.id}
            petName={pet.name}
            isPremium={isPremiumUser}
            initialPhotos={petPhotos}
            initialTotal={petPhotoTotal}
            openCompareIds={compare}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function formatDaysOfWeek(value: string) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .map((day) => labels[day] ?? "")
    .filter(Boolean)
    .join(", ");
}
