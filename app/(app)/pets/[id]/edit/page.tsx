import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PetForm } from "@/components/pets/pet-form";

type EditPetPageProps = {
  params: { id: string };
};

export default async function EditPetPage({ params }: EditPetPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, userId },
  });

  if (!pet) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Edit Pet</h1>
        <p className="text-muted-foreground">
          Update details and symptoms for {pet.name}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pet details</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm
            mode="edit"
            petId={pet.id}
            defaultValues={{
              name: pet.name,
              breed: pet.breed,
              age: pet.age,
              weight: pet.weight,
              photoUrl: pet.photoUrl ?? "",
              symptoms: Array.isArray(pet.symptoms)
                ? pet.symptoms.filter((symptom): symptom is string => typeof symptom === "string")
                : [],
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
