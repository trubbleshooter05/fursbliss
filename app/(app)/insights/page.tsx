import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightsPanel } from "@/components/insights/insights-panel";

type InsightsPageProps = {
  searchParams?: { petId?: string };
};

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const pets = await prisma.pet.findMany({
    where: { userId },
    select: { id: true, name: true, age: true, breed: true, symptoms: true },
  });

  if (pets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add a pet first</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Create a pet profile before requesting AI recommendations.</p>
          <Button asChild>
            <Link href="/pets/new">Add New Pet</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const recommendations = await prisma.recommendation.findMany({
    where: { pet: { userId } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <InsightsPanel
      pets={pets.map((pet) => ({
        ...pet,
        symptoms: Array.isArray(pet.symptoms) ? pet.symptoms : [],
      }))}
      recommendations={recommendations.map((rec) => ({
        id: rec.id,
        petId: rec.petId,
        createdAt: rec.createdAt.toISOString(),
        response: rec.response,
        notes: rec.notes,
      }))}
      subscriptionStatus={session.user.subscriptionStatus ?? "free"}
      defaultPetId={searchParams?.petId}
    />
  );
}
