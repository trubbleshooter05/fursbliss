"use client";

import { useMemo } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Pet } from "@prisma/client";
import { calculateHealthScore, getHealthFlags, getNextVetCheck } from "@/lib/health-score";
import type { HealthLogEntry } from "@/lib/health-score";

type HealthScorePanelProps = {
  pet: Pet;
  healthLogs: HealthLogEntry[];
  lastVetVisit?: Date;
};

export function HealthScorePanel({ pet, healthLogs, lastVetVisit }: HealthScorePanelProps) {
  const healthScore = useMemo(() => calculateHealthScore(healthLogs), [healthLogs]);
  const healthFlags = useMemo(() => getHealthFlags(healthLogs, pet), [healthLogs, pet]);
  const vetCheck = useMemo(() => getNextVetCheck(pet, lastVetVisit), [pet, lastVetVisit]);

  // If no data yet, show onboarding state
  if (!healthScore) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-2xl">Start tracking to see {pet.name}'s health score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Log at least 3 days of health data to unlock {pet.name}'s personalized health dashboard with:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>Real-time health score (0-100) with trend tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>Automatic red/yellow flags when patterns change</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>Vet check reminders based on {pet.name}'s age</span>
            </li>
          </ul>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/logs/new">Log Today's Health Data</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const trendIcon =
    healthScore.trend === "improving" ? (
      <TrendingUp className="h-5 w-5 text-emerald-600" />
    ) : healthScore.trend === "declining" ? (
      <TrendingDown className="h-5 w-5 text-rose-600" />
    ) : (
      <Minus className="h-5 w-5 text-muted-foreground" />
    );

  const scoreColor =
    healthScore.color === "green"
      ? "text-emerald-600 border-emerald-200 bg-emerald-50"
      : healthScore.color === "yellow"
        ? "text-amber-600 border-amber-200 bg-amber-50"
        : healthScore.color === "orange"
          ? "text-orange-600 border-orange-200 bg-orange-50"
          : "text-rose-600 border-rose-200 bg-rose-50";

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <span>{pet.name}'s Health Score</span>
            <div className="flex items-center gap-2">
              {trendIcon}
              <span className="text-sm font-normal text-muted-foreground capitalize">
                {healthScore.trend}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Circular Score Gauge */}
            <div className="relative">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                {/* Score circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(healthScore.score / 100) * 339.292} 339.292`}
                  strokeLinecap="round"
                  className={
                    healthScore.color === "green"
                      ? "text-emerald-500"
                      : healthScore.color === "yellow"
                        ? "text-amber-500"
                        : healthScore.color === "orange"
                          ? "text-orange-500"
                          : "text-rose-500"
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{healthScore.score}</span>
              </div>
            </div>

            {/* Score Label and Description */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <Badge className={`text-base ${scoreColor}`}>{healthScore.label}</Badge>
              <p className="text-sm text-muted-foreground">
                {healthScore.score >= 80
                  ? `${pet.name} is doing great! Continue your current routine and keep tracking daily to catch any changes early.`
                  : healthScore.score >= 60
                    ? `${pet.name} is mostly healthy, but watch the flags below. Small changes now can prevent bigger issues later.`
                    : healthScore.score >= 40
                      ? `${pet.name} needs attention. Review the red/yellow flags below and consider using the triage tool or scheduling a vet visit.`
                      : `${pet.name}'s health score is concerning. Please review the flags below and strongly consider contacting your vet today.`}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/logs/new">Update Today's Entry</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Flags */}
      {healthFlags.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Health Flags</h3>
          {healthFlags.map((flag, index) => {
            const flagIcon =
              flag.type === "red" ? (
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              ) : flag.type === "yellow" ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              );

            const flagBg =
              flag.type === "red"
                ? "border-rose-200 bg-rose-50"
                : flag.type === "yellow"
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50";

            return (
              <Card key={index} className={`border-2 ${flagBg}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {flagIcon}
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">{flag.title}</p>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                      {flag.triageLink ? (
                        <Button asChild variant="link" size="sm" className="h-auto p-0">
                          <Link href={flag.triageLink}>Use Triage Tool →</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Vet Check Countdown */}
      <Card className={vetCheck.overdue ? "border-2 border-orange-200 bg-orange-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Next Vet Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            {vetCheck.overdue ? (
              <p className="text-sm font-semibold text-orange-700">
                Vet check overdue by {vetCheck.weeksUntil} {vetCheck.weeksUntil === 1 ? "week" : "weeks"}
              </p>
            ) : (
              <p className="text-sm">
                Next vet check recommended in{" "}
                <span className="font-semibold">
                  {vetCheck.weeksUntil} {vetCheck.weeksUntil === 1 ? "week" : "weeks"}
                </span>
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Based on {pet.name}'s age ({pet.age} years), we recommend checkups {vetCheck.recommendedInterval}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/pets/${pet.id}`}>Log Vet Visit</Link>
            </Button>
            {vetCheck.overdue ? (
              <Button asChild size="sm" variant="default">
                <a
                  href={`https://www.google.com/search?q=veterinarian+near+me`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Find Vet Nearby
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
