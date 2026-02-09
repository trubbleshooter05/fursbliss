import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        </div>

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
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <span>{log.date.toDateString()}</span>
                  <span>Energy {log.energyLevel}/10</span>
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
      </div>
    </div>
  );
}
