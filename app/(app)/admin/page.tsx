import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Meta ad retention: signups since Feb 28 (proxy for Meta ads)
  const metaSince = new Date("2026-02-28");
  const metaCohort = await prisma.user.findMany({
    where: { createdAt: { gte: metaSince } },
    select: {
      id: true,
      email: true,
      createdAt: true,
      pets: {
        select: {
          _count: {
            select: {
              healthLogs: true,
              weeklyCheckIns: true,
              gutHealthLogs: true,
            },
          },
        },
      },
    },
  });

  const getHealthCount = (u: (typeof metaCohort)[0]) =>
    u.pets.reduce(
      (s, p) =>
        s +
        p._count.healthLogs +
        p._count.weeklyCheckIns +
        p._count.gutHealthLogs,
      0
    );
  const logged2Plus = metaCohort.filter((u) => getHealthCount(u) > 1).length;
  const logged1 = metaCohort.filter((u) => getHealthCount(u) === 1).length;
  const neverLogged = metaCohort.filter((u) => getHealthCount(u) === 0).length;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      email: true,
      subscriptionStatus: true,
      role: true,
      createdAt: true,
    },
  });

  const pets = await prisma.pet.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const logs = await prisma.healthLog.findMany({
    orderBy: { date: "desc" },
    take: 20,
    include: { pet: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Admin</h1>
        <p className="text-muted-foreground">Overview of platform activity.</p>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/ai-costs">Open AI Cost Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/startup-advisor">Startup Advisor</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meta ad retention (since Feb 28)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Of {metaCohort.length} signups: <strong>{logged2Plus}</strong> logged health data 2+ times,{" "}
            <strong>{logged1}</strong> logged once, <strong>{neverLogged}</strong> never logged.
          </p>
          <p className="mt-2 text-sm font-medium">
            {metaCohort.length === 0
              ? "No signups in this period."
              : logged2Plus >= metaCohort.length * 0.7
                ? "→ Distribution problem: find more of these people."
                : "→ Product/retention problem: deliver value faster."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.subscriptionStatus}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.createdAt.toDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent pets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pets.map((pet) => (
                <TableRow key={pet.id}>
                  <TableCell className="font-medium">{pet.name}</TableCell>
                  <TableCell>{pet.breed}</TableCell>
                  <TableCell>{pet.userId}</TableCell>
                  <TableCell>{pet.createdAt.toDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent health logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Energy</TableHead>
                <TableHead>Mood</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.pet.name}</TableCell>
                  <TableCell>{log.date.toDateString()}</TableCell>
                  <TableCell>{log.energyLevel}</TableCell>
                  <TableCell>{log.mood ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
