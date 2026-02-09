import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: { id: string };
};

export default async function BreedRisksPage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, userId },
  });

  if (!pet) {
    return notFound();
  }

  const profile = await prisma.breedProfile.findUnique({
    where: { breed: pet.breed },
  });

  const riskTimeline = profile?.riskTimeline
    ? (JSON.parse(profile.riskTimeline) as { age: number; risk: string; severity: string }[])
    : [];

  const supplementRecs = profile?.supplementRecs
    ? (JSON.parse(profile.supplementRecs) as { supplement: string; startAge: number; reason: string }[])
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge className="w-fit bg-emerald-500/10 text-emerald-600">
          Breed risk profile
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-900">
          {pet.breed} longevity timeline
        </h1>
        <p className="text-muted-foreground">
          Personalized risks and prevention tips for {pet.name}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {riskTimeline.length === 0 ? (
              <p>No breed timeline available yet.</p>
            ) : (
              riskTimeline.map((risk) => (
                <div
                  key={`${risk.age}-${risk.risk}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <span>
                    Age {risk.age}: {risk.risk}
                  </span>
                  <span className="text-xs font-semibold uppercase text-emerald-600">
                    {risk.severity}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended supplements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {supplementRecs.length === 0 ? (
              <p>No supplement guidance available yet.</p>
            ) : (
              supplementRecs.map((rec) => (
                <div
                  key={`${rec.supplement}-${rec.startAge}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <span>{rec.supplement}</span>
                  <span className="text-xs text-slate-600">
                    Start age {rec.startAge}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
