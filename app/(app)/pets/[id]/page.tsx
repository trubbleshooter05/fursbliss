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

type PetDetailPageProps = {
  params: { id: string };
};

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, userId },
    include: {
      healthLogs: { orderBy: { date: "desc" } },
      weightLogs: { orderBy: { date: "desc" } },
      photoLogs: { orderBy: { createdAt: "desc" }, take: 6 },
      medications: { where: { active: true }, orderBy: { createdAt: "desc" } },
      doseSchedules: { where: { active: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!pet) {
    notFound();
  }

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
            <Link href={`/pets/${pet.id}/vet-share`}>Vet Share</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/pets/${pet.id}/edit`}>Edit</Link>
          </Button>
          <MedicationForm petId={pet.id} />
          <DoseScheduleForm petId={pet.id} />
          <DeletePetDialog petId={pet.id} petName={pet.name} />
        </div>
      </div>

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
            {pet.healthLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
                No logs yet. Capture the first health check today.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Energy</TableHead>
                    <TableHead>Mood</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pet.healthLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(log.date, "MMM d, yyyy")}</TableCell>
                      <TableCell>{log.energyLevel}</TableCell>
                      <TableCell>{log.mood ?? "—"}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {log.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
          <CardTitle>Photo progress</CardTitle>
        </CardHeader>
        <CardContent>
          {pet.photoLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
              Add photos in daily logs to track progress.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {pet.photoLogs.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.imageUrl}
                  alt="Progress"
                  className="h-40 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
