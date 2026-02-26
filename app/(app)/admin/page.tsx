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
        <div className="mt-3">
          <Button asChild variant="outline">
            <Link href="/admin/ai-costs">Open AI Cost Dashboard</Link>
          </Button>
        </div>
      </div>

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
