import Link from "next/link";
import { format, startOfWeek } from "date-fns";
import { Activity, HeartPulse, PawPrint } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnergyTrendChart } from "@/components/dashboard/energy-trend-chart";
import { ReminderPanel } from "@/components/dashboard/reminder-panel";
import { AnimateIn } from "@/components/ui/animate-in";
import { MilestoneUpgradeCard } from "@/components/dashboard/milestone-upgrade-card";
import { HealthScorePanel } from "@/components/dashboard/health-score-panel";
import { MissedAlertsPreview } from "@/components/dashboard/missed-alerts-preview";
import { PatternAlertsCard } from "@/components/dashboard/pattern-alerts-card";
import { calculateHealthScore, getHealthFlags } from "@/lib/health-score";
import { detectPatternChanges } from "@/lib/pattern-detection";
import type { HealthLogEntry } from "@/lib/health-score";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const [pets, healthLogs, healthLogsThisWeek, notifications, allLogs] = await Promise.all([
    prisma.pet.findMany({
      where: { userId },
      include: { healthLogs: { orderBy: { date: "desc" }, take: 1 } },
    }),
    prisma.healthLog.findMany({
      where: { pet: { userId } },
      orderBy: { date: "desc" },
      take: 6,
      include: { pet: true },
    }),
    prisma.healthLog.count({
      where: {
        pet: { userId },
        date: { gte: startOfWeek(new Date(), { weekStartsOn: 1 }) },
      },
    }),
    prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.healthLog.findMany({
      where: { pet: { userId } },
      orderBy: { date: "desc" },
      select: {
        date: true,
        energyLevel: true,
        appetite: true,
        appetiteLevel: true,
        mobilityLevel: true,
        weight: true,
        symptoms: true,
        petId: true,
        pet: {
          select: {
            name: true,
            breed: true,
          },
        },
      },
      take: 500,
    }),
  ]);

  const isPremiumUser = session.user.subscriptionStatus === "premium";
  const latestLogDate = allLogs[0]?.date ?? null;
  const daysSinceLastLog = latestLogDate
    ? Math.floor((Date.now() - latestLogDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  type AggregatedPetLogData = {
    days: Set<string>;
    petName: string;
    breed: string;
    logs: {
      date: Date;
      energyLevel: number;
      appetite: string | null;
    }[];
  };
  const trackingDaysByPet = new Map<string, AggregatedPetLogData>();
  for (const log of allLogs) {
    const existing = trackingDaysByPet.get(log.petId) ?? {
      days: new Set<string>(),
      petName: log.pet.name,
      breed: log.pet.breed,
      logs: [],
    };
    existing.days.add(log.date.toISOString().slice(0, 10));
    existing.logs.push(log);
    trackingDaysByPet.set(log.petId, existing);
  }

  let milestoneCardData: {
    dogName: string;
    breed: string;
    daysTracked: number;
    appetitePreview: string;
    energyPreview: string;
  } | null = null;

  for (const data of Array.from(trackingDaysByPet.values())) {
    const trackedDays = data.days.size;
    if (trackedDays < 30) continue;

    const appetiteKnown = data.logs.filter((petLog) => (petLog.appetite ?? "").trim().length > 0);
    const appetiteValues = appetiteKnown.map((petLog) => petLog.appetite?.toLowerCase() ?? "");
    const appetitePreview =
      appetiteValues.length < 3
        ? "building baseline"
        : appetiteValues.every((appetiteValue) => appetiteValue === appetiteValues[0])
          ? "stable"
          : "varied slightly";

    const recentEnergy = data.logs.slice(0, 7).map((petLog) => petLog.energyLevel);
    const olderEnergy = data.logs.slice(7, 14).map((petLog) => petLog.energyLevel);
    const avgRecent =
      recentEnergy.length === 0
        ? 0
        : recentEnergy.reduce((sum, energyValue) => sum + energyValue, 0) / recentEnergy.length;
    const avgOlder =
      olderEnergy.length === 0
        ? avgRecent
        : olderEnergy.reduce((sum, energyValue) => sum + energyValue, 0) / olderEnergy.length;

    const delta = avgRecent - avgOlder;
    const energyPreview =
      Math.abs(delta) < 0.4 ? "stable" : delta > 0 ? "trending up" : "trending down slightly";

    milestoneCardData = {
      dogName: data.petName,
      breed: data.breed,
      daysTracked: trackedDays,
      appetitePreview,
      energyPreview,
    };
    break;
  }

  const averageEnergy =
    healthLogs.length === 0
      ? 0
      : Math.round(
          (healthLogs.reduce((sum: number, log) => sum + log.energyLevel, 0) /
            healthLogs.length) *
            10
        ) / 10;

  const chartData = healthLogs
    .slice()
    .reverse()
    .map((log) => ({
      date: format(log.date, "MMM d"),
      energy: log.energyLevel,
    }));

  // Calculate missed alerts for free users
  let missedAlertsData: {
    petName: string;
    scoreChange: number;
    flags: Array<{ id: string; type: "red" | "yellow" | "green"; title: string; description: string }>;
    daysTracked: number;
  } | null = null;

  // Calculate pattern alerts for all users (but gate display for free users)
  let patternAlertsData: {
    petName: string;
    alerts: Awaited<ReturnType<typeof detectPatternChanges>>;
  } | null = null;

  if (pets[0]) {
    const primaryPet = pets[0];
    const primaryPetLogs = allLogs
      .filter((log) => log.petId === primaryPet.id)
      .map((log) => ({
        id: primaryPet.id,
        date: log.date,
        energyLevel: log.energyLevel,
        appetite: log.appetite,
        appetiteLevel: log.appetiteLevel,
        mobilityLevel: log.mobilityLevel,
        weight: log.weight,
        symptoms: log.symptoms,
      })) as HealthLogEntry[];

    // Pattern detection for premium users OR free users (for preview)
    if (primaryPetLogs.length >= 7) {
      const patternAlerts = detectPatternChanges(primaryPetLogs);
      if (patternAlerts.length > 0) {
        patternAlertsData = {
          petName: primaryPet.name,
          alerts: patternAlerts,
        };
      }
    }

    // Missed alerts preview for free users only
    if (!isPremiumUser && primaryPetLogs.length >= 7) {
      const currentScore = calculateHealthScore(primaryPetLogs);
      const previousScore = calculateHealthScore(primaryPetLogs.slice(1));
      const flags = getHealthFlags(primaryPetLogs, primaryPet);

      if (currentScore && previousScore) {
        const scoreChange = currentScore.score - previousScore.score;
        const daysTracked = new Set(
          primaryPetLogs.map((log) => log.date.toISOString().slice(0, 10))
        ).size;

        // Only show if there are meaningful alerts
        const hasRedFlags = flags.some((f) => f.type === "red");
        const hasYellowFlags = flags.some((f) => f.type === "yellow");
        const significantChange = Math.abs(scoreChange) >= 10;

        if (hasRedFlags || hasYellowFlags || significantChange) {
          missedAlertsData = {
            petName: primaryPet.name,
            scoreChange,
            flags: flags.map(f => ({ id: `${primaryPet.id}-${f.title}`, type: f.type, title: f.title, description: f.description })),
            daysTracked,
          };
        }
      }
    }
  }

  return (
    <div className="space-y-8">
      <AnimateIn className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-[-0.02em] text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your pet wellness activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
            <Link href="/pets/new">Add Pet</Link>
          </Button>
          <Button variant="outline" className="hover:scale-[1.02] transition-all duration-300" asChild>
            <Link href="/logs/new">Log Health</Link>
          </Button>
        </div>
      </AnimateIn>

      {/* Health Score Panel - Shows for primary pet if they have tracking data */}
      {pets[0] && allLogs.length > 0 ? (
        <AnimateIn delay={0.1}>
          <HealthScorePanel
            pet={pets[0]}
            healthLogs={allLogs
              .filter((log) => log.petId === pets[0].id)
              .map((log) => ({
                id: log.petId,
                date: log.date,
                energyLevel: log.energyLevel,
                appetite: log.appetite,
                appetiteLevel: log.appetiteLevel,
                mobilityLevel: log.mobilityLevel,
                weight: log.weight,
                symptoms: log.symptoms,
              }))}
          />
        </AnimateIn>
      ) : null}

      {/* Missed Alerts Preview - Shows for free users when there are health alerts */}
      {missedAlertsData ? (
        <AnimateIn delay={0.15}>
          <MissedAlertsPreview
            petName={missedAlertsData.petName}
            scoreChange={missedAlertsData.scoreChange}
            flags={missedAlertsData.flags}
            daysTracked={missedAlertsData.daysTracked}
          />
        </AnimateIn>
      ) : null}

      {/* Pattern Alerts - Premium users see full details, free users see gated preview */}
      {patternAlertsData ? (
        <AnimateIn delay={0.2}>
          <PatternAlertsCard
            alerts={patternAlertsData.alerts}
            isPremium={isPremiumUser}
            petName={patternAlertsData.petName}
          />
        </AnimateIn>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <AnimateIn>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PawPrint className="h-4 w-4 text-primary" />Total pets</CardTitle>
          </CardHeader>
          <CardContent className="stat-number text-4xl font-semibold">
            {pets.length}
          </CardContent>
        </Card>
        </AnimateIn>
        <AnimateIn delay={0.1}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Health logs this week</CardTitle>
          </CardHeader>
          <CardContent className="stat-number text-4xl font-semibold">
            {healthLogsThisWeek}
          </CardContent>
        </Card>
        </AnimateIn>
        <AnimateIn delay={0.2}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" />Average energy level</CardTitle>
          </CardHeader>
          <CardContent className="stat-number text-4xl font-semibold">
            {averageEnergy || "—"}
          </CardContent>
        </Card>
        </AnimateIn>
      </div>

      {!isPremiumUser && milestoneCardData && (
        <AnimateIn>
          <MilestoneUpgradeCard {...milestoneCardData} />
        </AnimateIn>
      )}

      {!isPremiumUser && daysSinceLastLog !== null && daysSinceLastLog >= 7 && pets[0] && (
        <AnimateIn>
          <Card className="rounded-2xl border-emerald-200 bg-emerald-50/50">
            <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="font-medium text-emerald-900">
                  {pets[0].name} missed you! You haven&apos;t logged in {daysSinceLastLog} days.
                </p>
                <p className="text-sm text-emerald-800/80">
                  Pick up where you left off — your tracking data is safe.
                </p>
              </div>
              <Button asChild>
                <Link href="/logs/new">Log Today&apos;s Health Check</Link>
              </Button>
            </CardContent>
          </Card>
        </AnimateIn>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AnimateIn>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Energy trend</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 1 ? (
              <EnergyTrendChart data={chartData} />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Log health entries to unlock trend charts.
              </div>
            )}
          </CardContent>
        </Card>
        </AnimateIn>
        <AnimateIn delay={0.1}>
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Pets snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pets.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
                No pets yet. Add your first pet to start tracking.
              </div>
            )}
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {pet.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{pet.breed}</p>
                </div>
                {pet.healthLogs[0] ? (
                  <Badge variant="secondary">
                    {format(pet.healthLogs[0].date, "MMM d")}
                  </Badge>
                ) : (
                  <Badge variant="outline">No logs</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        </AnimateIn>
      </div>

      <AnimateIn>
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderPanel notifications={notifications} />
        </CardContent>
      </Card>
      </AnimateIn>

      <AnimateIn>
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Recent health logs</CardTitle>
        </CardHeader>
        <CardContent>
          {healthLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
              No health logs yet. Start by logging today&apos;s wellness check.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Energy</TableHead>
                  <TableHead className="hidden md:table-cell">Mood</TableHead>
                  <TableHead className="hidden lg:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.pet.name}</TableCell>
                    <TableCell>{format(log.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>{log.energyLevel}</TableCell>
                    <TableCell className="hidden md:table-cell">{log.mood ?? "—"}</TableCell>
                    <TableCell className="hidden max-w-[240px] truncate lg:table-cell">
                      {log.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </AnimateIn>
    </div>
  );
}
