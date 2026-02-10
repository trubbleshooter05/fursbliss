import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VetCommentForm } from "@/components/pets/vet-comment-form";

type PageProps = {
  params: { token: string };
};

export default async function VetViewPage({ params }: PageProps) {
  const link = await prisma.vetShareLink.findUnique({
    where: { token: params.token },
    include: {
      pet: {
        include: {
          healthLogs: { orderBy: { date: "desc" }, take: 10 },
          medications: { where: { active: true } },
          weightLogs: { orderBy: { date: "desc" }, take: 10 },
          recommendations: { orderBy: { createdAt: "desc" }, take: 5 },
          photoLogs: { orderBy: { createdAt: "desc" }, take: 6 },
          doseSchedules: { where: { active: true }, orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  if (!link || link.expiresAt < new Date()) {
    return notFound();
  }

  await prisma.vetShareLink.update({
    where: { id: link.id },
    data: { viewCount: { increment: 1 } },
  });

  const pet = link.pet;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-2">
          <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
            Vet Share
          </Badge>
          <h1 className="text-3xl font-semibold text-slate-900">{pet.name}</h1>
          <p className="text-muted-foreground">
            {pet.breed} • {pet.age} years • {pet.weight} lbs
          </p>
          <p className="text-xs text-muted-foreground">
            Secure read-only clinical snapshot. Link expires{" "}
            {format(link.expiresAt, "MMM d, yyyy")} • Views: {link.viewCount + 1}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Species/breed: {pet.species} / {pet.breed}
            </p>
            <p>
              Current baseline: {pet.age} years • {pet.weight} lbs
            </p>
            <p>
              Owner-reported symptoms:{" "}
              {Array.isArray(pet.symptoms)
                ? pet.symptoms
                    .filter((value): value is string => typeof value === "string")
                    .join(", ") || "None reported"
                : "None reported"}
            </p>
            <p className="text-xs">
              This report is informational and does not replace direct clinical
              examination.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent health logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {pet.healthLogs.length === 0 ? (
              <p>No health logs yet.</p>
            ) : (
              pet.healthLogs.map((log) => (
                <div
                  key={log.id}
                  className="space-y-1 rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      {format(log.date, "MMM d, yyyy")}
                    </span>
                    <span>Energy {log.energyLevel}/10</span>
                  </div>
                  <p className="text-xs">
                    Mood: {log.mood ?? "-"} • Appetite: {log.appetite ?? "-"} •
                    Mobility: {log.mobilityLevel ?? "-"}
                  </p>
                  {log.notes && <p className="text-xs">Notes: {log.notes}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {pet.medications.length === 0 ? (
              <p>No active medications listed.</p>
            ) : (
              pet.medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <span>{med.name}</span>
                  <span>{med.dosage}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplement schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {pet.doseSchedules.length === 0 ? (
              <p>No active supplement schedules listed.</p>
            ) : (
              pet.doseSchedules.map((dose) => (
                <div
                  key={dose.id}
                  className="space-y-1 rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <p className="font-medium text-slate-900">{dose.supplementName}</p>
                  <p>
                    {dose.dosage} • {dose.frequency}
                  </p>
                  {dose.notes && <p className="text-xs">Notes: {dose.notes}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {pet.weightLogs.length === 0 ? (
              <p>No weight entries yet.</p>
            ) : (
              pet.weightLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2"
                >
                  <span>{format(entry.date, "MMM d, yyyy")}</span>
                  <span>{entry.weight} lbs</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent AI recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {pet.recommendations.length === 0 ? (
              <p>No AI recommendations yet.</p>
            ) : (
              pet.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="space-y-1 rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <p className="text-xs">{format(rec.createdAt, "MMM d, yyyy")}</p>
                  <p className="whitespace-pre-wrap text-xs">{rec.response}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photo timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {pet.photoLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {pet.photoLogs.map((photo) => (
                  <div key={photo.id} className="space-y-1">
                    <img
                      src={photo.imageUrl}
                      alt="Progress"
                      className="h-28 w-full rounded-xl object-cover"
                    />
                    <p className="text-xs text-muted-foreground">
                      {format(photo.createdAt, "MMM d")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Veterinarian comment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {link.vetComment && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs">
                Latest note: {link.vetComment}
              </div>
            )}
            <VetCommentForm token={params.token} initialComment={link.vetComment} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
