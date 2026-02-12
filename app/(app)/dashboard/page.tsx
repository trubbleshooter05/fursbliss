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

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const [pets, healthLogs, healthLogsThisWeek, notifications] = await Promise.all([
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
  ]);

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
