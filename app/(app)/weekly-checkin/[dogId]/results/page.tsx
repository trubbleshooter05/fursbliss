import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, TrendingDown, ArrowRight, Calendar } from "lucide-react";
import { generateWeekOverWeekInsights } from "@/lib/week-comparison";
import type { HealthLogEntry } from "@/lib/health-score";
import { format } from "date-fns";

type PageProps = {
  params: { dogId: string };
  searchParams: { week?: string };
};

export default async function WeeklyCheckInResultsPage({ params, searchParams }: PageProps) {
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

  // Parse week start date from query params
  const weekStartDate = searchParams.week ? new Date(searchParams.week) : new Date();
  
  // Get current week's check-in
  const checkIn = await prisma.weeklyCheckIn.findFirst({
    where: {
      petId: pet.id,
      userId: session.user.id,
      weekStartDate,
    },
  });

  if (!checkIn) {
    return notFound();
  }

  // Get health logs for current week and previous week
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const previousWeekStart = new Date(weekStartDate);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const [currentWeekLogs, previousWeekLogs] = await Promise.all([
    prisma.healthLog.findMany({
      where: {
        petId: pet.id,
        date: {
          gte: weekStartDate,
          lt: weekEnd,
        },
      },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        energyLevel: true,
        appetite: true,
        appetiteLevel: true,
        mobilityLevel: true,
        weight: true,
        symptoms: true,
      },
    }),
    prisma.healthLog.findMany({
      where: {
        petId: pet.id,
        date: {
          gte: previousWeekStart,
          lt: weekStartDate,
        },
      },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        energyLevel: true,
        appetite: true,
        appetiteLevel: true,
        mobilityLevel: true,
        weight: true,
        symptoms: true,
      },
    }),
  ]);

  // Generate insights
  const insights = generateWeekOverWeekInsights(
    currentWeekLogs as HealthLogEntry[],
    previousWeekLogs as HealthLogEntry[],
    {
      energyLevel: checkIn.energyLevel,
      appetite: checkIn.appetite,
      newSymptoms: checkIn.newSymptoms,
      vetVisit: checkIn.vetVisit,
    },
    pet.age
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span>Weekly Check-In Results</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {pet.name}'s Week in Review
            </h1>
            <p className="text-muted-foreground">
              {format(weekStartDate, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </p>
          </div>
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
      </div>

      {/* Overall Trend Badge */}
      <Card className={`border-2 ${
        insights.overallTrend === "improving"
          ? "border-emerald-200 bg-emerald-50"
          : insights.overallTrend === "declining"
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-slate-50"
      }`}>
        <CardContent className="flex items-center gap-4 p-6">
          {insights.overallTrend === "improving" ? (
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          ) : insights.overallTrend === "declining" ? (
            <TrendingDown className="h-8 w-8 text-amber-600" />
          ) : (
            <ArrowRight className="h-8 w-8 text-slate-600" />
          )}
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">
              Overall: {insights.overallTrend === "improving" ? "Improving" : insights.overallTrend === "declining" ? "Needs attention" : "Stable"}
            </p>
            <p className="text-sm text-muted-foreground">
              Compared to last week
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Week-over-Week Comparisons */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Compared to last week:
        </h2>

        {insights.comparisons.map((comparison, idx) => (
          <Card
            key={idx}
            className={`${
              comparison.status === "improved"
                ? "border-emerald-200 bg-emerald-50/50"
                : comparison.status === "declined"
                ? "border-amber-200 bg-amber-50/50"
                : "border-slate-200 bg-slate-50/50"
            }`}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div className="text-2xl">{comparison.icon}</div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-foreground">{comparison.message}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>This week: {comparison.currentValue}</span>
                  <span>•</span>
                  <span>Last week: {comparison.previousValue}</span>
                </div>
              </div>
              <Badge
                variant={
                  comparison.status === "improved"
                    ? "default"
                    : comparison.status === "declined"
                    ? "destructive"
                    : "secondary"
                }
              >
                {comparison.status === "improved" ? "Improved" : comparison.status === "declined" ? "Watch" : "Stable"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Vet Check */}
      {insights.nextVetCheck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Vet Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Based on {pet.name}'s age ({pet.age} years), recommended vet check in{" "}
              <span className="font-semibold text-foreground">
                {insights.nextVetCheck.weeksUntil} weeks
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notes from Check-In */}
      {(checkIn.symptomDetails || checkIn.vetVisitDetails || checkIn.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkIn.symptomDetails && (
              <div>
                <p className="text-sm font-semibold text-foreground">New Symptoms:</p>
                <p className="text-sm text-muted-foreground">{checkIn.symptomDetails}</p>
              </div>
            )}
            {checkIn.vetVisitDetails && (
              <div>
                <p className="text-sm font-semibold text-foreground">Vet Visit:</p>
                <p className="text-sm text-muted-foreground">{checkIn.vetVisitDetails}</p>
              </div>
            )}
            {checkIn.notes && (
              <div>
                <p className="text-sm font-semibold text-foreground">Additional Notes:</p>
                <p className="text-sm text-muted-foreground">{checkIn.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href={`/pets/${pet.id}`}>View Full History</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
