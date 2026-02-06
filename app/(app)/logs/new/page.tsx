import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthLogForm } from "@/components/logs/health-log-form";

type NewLogPageProps = {
  searchParams?: { petId?: string };
};

export default async function NewLogPage({ searchParams }: NewLogPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const pets = await prisma.pet.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  if (pets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add a pet first</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Create a pet profile before logging daily health.</p>
          <Button asChild>
            <Link href="/pets/new">Add New Pet</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Daily Log</h1>
        <p className="text-muted-foreground">
          Track today&apos;s wellness signals in seconds.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Log details</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthLogForm pets={pets} defaultPetId={searchParams?.petId} />
        </CardContent>
      </Card>
    </div>
  );
}
