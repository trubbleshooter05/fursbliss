"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type MedicationFormProps = {
  petId: string;
};

export function MedicationForm({ petId }: MedicationFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  const handleSave = async () => {
    const response = await fetch(`/api/pets/${petId}/medications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, dosage, frequency }),
    });

    if (!response.ok) {
      toast({
        title: "Unable to save medication",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Medication added" });
    setOpen(false);
    setName("");
    setDosage("");
    setFrequency("");
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add medication</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add medication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Medication name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Dosage (e.g. 5mg)" value={dosage} onChange={(e) => setDosage(e.target.value)} />
          <Input placeholder="Frequency (e.g. twice daily)" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
