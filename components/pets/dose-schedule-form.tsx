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

type DoseScheduleFormProps = {
  petId: string;
};

export function DoseScheduleForm({ petId }: DoseScheduleFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [supplementName, setSupplementName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [times, setTimes] = useState("Morning, Evening");
  const [daysOfWeek, setDaysOfWeek] = useState("1,3,5");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    const response = await fetch(`/api/pets/${petId}/doses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplementName,
        dosage,
        frequency,
        times: times.split(",").map((time) => time.trim()),
        daysOfWeek: daysOfWeek
          .split(",")
          .map((day) => Number(day.trim()))
          .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        notes,
      }),
    });

    if (!response.ok) {
      toast({
        title: "Unable to save schedule",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Schedule added" });
    setOpen(false);
    setSupplementName("");
    setDosage("");
    setFrequency("daily");
    setTimes("Morning, Evening");
    setDaysOfWeek("1,3,5");
    setNotes("");
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add schedule</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supplement schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Supplement name"
            value={supplementName}
            onChange={(e) => setSupplementName(e.target.value)}
          />
          <Input
            placeholder="Dosage (e.g. 1 softgel)"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
          <Input
            placeholder="Frequency (e.g. daily, weekly)"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />
          <Input
            placeholder="Times (comma separated)"
            value={times}
            onChange={(e) => setTimes(e.target.value)}
          />
          <Input
            placeholder="Weekdays for weekly doses (0-6 comma separated, Sun=0)"
            value={daysOfWeek}
            onChange={(e) => setDaysOfWeek(e.target.value)}
          />
          <Input
            placeholder="Optional notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
