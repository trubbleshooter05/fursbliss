import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EligibilityChecker } from "@/components/longevity/eligibility-checker";

export default async function AppLongevityDrugsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const [pets, statuses] = await Promise.all([
    prisma.pet.findMany({
      where: { userId },
      select: { id: true, name: true, age: true, weight: true, species: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.fDADrugStatus.findMany({
      orderBy: { lastUpdated: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge className="w-fit bg-emerald-500/10 text-emerald-700">
          Premium longevity tracker
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900">LOY-002 Hub</h1>
        <p className="text-muted-foreground">
          Check eligibility for each pet, monitor FDA progress, and plan with your
          veterinarian.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {pets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No pets yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Add a pet profile first, then return here to run LOY-002 eligibility
              checks.
            </CardContent>
          </Card>
        ) : (
          pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader>
                <CardTitle>{pet.name} eligibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Current profile: {pet.age} years, {pet.weight} lbs, {pet.species}
                </p>
                <EligibilityChecker
                  defaultAge={pet.age}
                  defaultWeight={pet.weight}
                  defaultSpecies={pet.species}
                  petName={pet.name}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest FDA timeline updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {statuses.length === 0 ? (
            <p>No status updates available yet.</p>
          ) : (
            statuses.map((status) => (
              <div
                key={status.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="font-medium text-slate-900">{status.drugName}</p>
                <p>{status.currentStatus}</p>
                <p className="text-xs">Updated {status.lastUpdated.toDateString()}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
