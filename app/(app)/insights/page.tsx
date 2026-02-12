import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightsPanel } from "@/components/insights/insights-panel";
import { AnimateIn } from "@/components/ui/animate-in";

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
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Add a pet first</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Create a pet profile before requesting AI recommendations.</p>
          <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
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
    <div className="space-y-6">
      <AnimateIn className="space-y-2">
        <h1 className="font-display text-4xl tracking-[-0.02em] text-foreground">AI Insights</h1>
        <p className="text-muted-foreground">
          Evidence-rated guidance, interaction checks, and longevity-focused recommendations.
        </p>
      </AnimateIn>
      <AnimateIn delay={0.08}>
        <InsightsPanel
          pets={pets.map((pet) => ({
            ...pet,
            symptoms: Array.isArray(pet.symptoms)
              ? pet.symptoms.filter((symptom): symptom is string => typeof symptom === "string")
              : [],
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
      </AnimateIn>
    </div>
  );
}
