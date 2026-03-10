import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";
import { PhotoTimeline } from "@/components/pets/photo-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ id: string }> };

export default async function PhotoTimelinePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id: petId } = await params;

  const [pet, user] = await Promise.all([
    prisma.pet.findFirst({ where: { id: petId, userId: session.user.id }, select: { id: true, name: true } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
    }),
  ]);

  if (!pet) notFound();

  const isPremium = isSubscriptionActive(user ?? {});

  const [photosRaw, totalCount] = await Promise.all([
    prisma.petPhoto.findMany({
      where: { petId, userId: session.user.id },
      orderBy: { takenAt: "desc" },
      take: isPremium ? 200 : 3,
      select: { id: true, imageUrl: true, category: true, bodyArea: true, notes: true, takenAt: true, createdAt: true },
    }),
    prisma.petPhoto.count({ where: { petId, userId: session.user.id } }),
  ]);

  const photos = photosRaw.map((p) => ({
    ...p,
    takenAt: p.takenAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge className="w-fit bg-emerald-500/10 text-emerald-600">Photo Timeline</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">{pet.name}&apos;s Visual Health Record</h1>
        <p className="text-muted-foreground">
          Snap and upload photos tagged to dates — track lumps, skin changes, mobility, and more over time.
        </p>
        <p className="text-xs text-muted-foreground">
          Not a medical diagnosis. Share photos with your vet for professional review.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoTimeline
            petId={pet.id}
            petName={pet.name}
            isPremium={isPremium}
            initialPhotos={photos}
            initialTotal={totalCount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
