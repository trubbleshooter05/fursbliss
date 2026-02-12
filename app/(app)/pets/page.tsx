import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimateIn } from "@/components/ui/animate-in";

export default async function PetsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const pets = await prisma.pet.findMany({
    where: { userId },
    include: { healthLogs: { orderBy: { date: "desc" }, take: 1 } },
  });

  return (
    <div className="space-y-8">
      <AnimateIn className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-[-0.02em] text-foreground">My Pets</h1>
          <p className="text-muted-foreground">
            Manage pet profiles and track their latest health check-ins.
          </p>
        </div>
        <Button className="hover:scale-[1.02] transition-all duration-300" asChild>
          <Link href="/pets/new">Add New Pet</Link>
        </Button>
      </AnimateIn>

      {pets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No pets yet. Add your first pet to begin tracking.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet, index) => (
            <AnimateIn key={pet.id} delay={(index % 6) * 0.06}>
            <Card className="overflow-hidden rounded-2xl border-border">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center justify-between font-display text-2xl">
                  <span>{pet.name}</span>
                  <Badge variant="outline">{pet.breed}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Age {pet.age} • {pet.weight} lbs
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {pet.photoUrl ? (
                  <Image
                    src={pet.photoUrl}
                    alt={pet.name}
                    width={700}
                    height={420}
                    className="h-36 w-full rounded-xl object-cover sm:h-40"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center rounded-xl bg-slate-100 text-sm text-muted-foreground sm:h-40">
                    No photo uploaded
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last logged</span>
                  <span className="font-medium text-slate-900">
                    {pet.healthLogs[0]
                      ? format(pet.healthLogs[0].date, "MMM d, yyyy")
                      : "No logs yet"}
                  </span>
                </div>
                <Button variant="outline" className="w-full hover:scale-[1.02] transition-all duration-300" asChild>
                  <Link href={`/pets/${pet.id}`}>View Details</Link>
                </Button>
                <Button variant="ghost" className="w-full hover:scale-[1.02] transition-all duration-300" asChild>
                  <a href={`/api/exports/pet-report?petId=${pet.id}`}>
                    Download report (PDF)
                  </a>
                </Button>
              </CardContent>
            </Card>
            </AnimateIn>
          ))}
        </div>
      )}
    </div>
  );
}
