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
    include: {
      doseSchedules: {
        where: { active: true },
        select: { supplementName: true },
      },
    },
  });

  if (!pet) {
    return notFound();
  }

  const profile = await prisma.breedProfile.findUnique({
    where: { breed: pet.breed },
  });

  const riskTimeline = safeParseTimeline(profile?.riskTimeline).sort(
    (a, b) => a.age - b.age
  );

  const supplementRecs = safeParseSupplements(profile?.supplementRecs).sort(
    (a, b) => a.startAge - b.startAge
  );
  const activeSupplements = new Set(
    pet.doseSchedules.map((dose) => dose.supplementName.toLowerCase())
  );

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
                  className={`rounded-xl border px-4 py-3 ${
                    pet.age >= risk.age
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      Age {risk.age}: {risk.risk}
                    </span>
                    <span className="text-xs font-semibold uppercase text-emerald-600">
                      {risk.severity}
                    </span>
                  </div>
                  {pet.age >= risk.age && (
                    <p className="mt-2 text-xs font-medium text-emerald-700">
                      You are here: active monitoring window
                    </p>
                  )}
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
                  className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{rec.supplement}</span>
                    <span className="text-xs text-slate-600">
                      Start age {rec.startAge}
                    </span>
                  </div>
                  <p className="text-xs">{rec.reason}</p>
                  <p className="text-xs">
                    {activeSupplements.has(rec.supplement.toLowerCase())
                      ? "✅ Currently in your schedule"
                      : "⬜ Not in your schedule yet"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function safeParseTimeline(
  value?: string | null
): Array<{ age: number; risk: string; severity: string }> {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => ({
        age: Number(item?.age ?? 0),
        risk: typeof item?.risk === "string" ? item.risk : "Unknown risk",
        severity:
          typeof item?.severity === "string" ? item.severity : "monitor",
      }))
      .filter((item) => Number.isFinite(item.age) && item.age > 0);
  } catch {
    return [];
  }
}

function safeParseSupplements(
  value?: string | null
): Array<{ supplement: string; startAge: number; reason: string }> {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => ({
        supplement:
          typeof item?.supplement === "string" ? item.supplement : "Supplement",
        startAge: Number(item?.startAge ?? 0),
        reason: typeof item?.reason === "string" ? item.reason : "",
      }))
      .filter((item) => Number.isFinite(item.startAge) && item.startAge > 0);
  } catch {
    return [];
  }
}
