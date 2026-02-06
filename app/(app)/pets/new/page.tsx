import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PetForm } from "@/components/pets/pet-form";

export default function NewPetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Add New Pet</h1>
        <p className="text-muted-foreground">
          Create a profile to start tracking daily health.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pet details</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
