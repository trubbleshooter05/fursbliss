"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DoseItem = {
  id: string;
  supplementName: string;
  dosage: string;
  frequency: string;
  scheduledTime: string | null;
  pet: { id: string; name: string };
};

type PetOption = { id: string; name: string };

export function DoseTracker({
  initialItems,
  pets,
  isPremium,
}: {
  initialItems: DoseItem[];
  pets: PetOption[];
  isPremium: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [supplement, setSupplement] = useState("");
  const [doseMg, setDoseMg] = useState("500");
  const [timeOfDay, setTimeOfDay] = useState("08:00");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const streak = useMemo(() => {
    const base = Math.min(7, items.length + 1);
    return base;
  }, [items.length]);

  const addSchedule = async () => {
    if (!petId || !supplement.trim()) return;
    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch("/api/doses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          supplement: supplement.trim(),
          doseMg: Number(doseMg),
          timeOfDay,
          frequency: "daily",
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to add schedule.");
      }
      setItems((prev) => [payload.item, ...prev]);
      setSupplement("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to add schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  const logDose = async (id: string, skipped = false) => {
    setError(null);
    setLoggingId(id);
    try {
      const response = await fetch(`/api/doses/${id}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipped }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message ?? "Unable to log dose.");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (logError) {
      setError(logError instanceof Error ? logError.message : "Unable to log dose.");
    } finally {
      setLoggingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Today&apos;s doses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-sm text-foreground">
            <Flame className="h-4 w-4 text-accent-foreground" /> {streak} day streak
          </p>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
              No active dose schedules yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{item.supplementName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.pet.name} • {item.dosage} • {item.frequency} •{" "}
                        {item.scheduledTime ?? "any time"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={loggingId === item.id}
                        onClick={() => logDose(item.id, false)}
                      >
                        Taken
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loggingId === item.id}
                        onClick={() => logDose(item.id, true)}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Add supplement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {["Glucosamine", "Fish Oil", "CoQ10", "Probiotics", "CBD", "Turmeric"].map(
              (chip) => (
                <button
                  key={chip}
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs transition hover:border-primary hover:text-primary"
                  onClick={() => setSupplement(chip)}
                >
                  {chip}
                </button>
              )
            )}
          </div>
          <select
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            value={petId}
            onChange={(event) => setPetId(event.target.value)}
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="Supplement name"
            value={supplement}
            onChange={(event) => setSupplement(event.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="number"
              min={1}
              placeholder="Dose (mg)"
              value={doseMg}
              onChange={(event) => setDoseMg(event.target.value)}
            />
            <Input
              type="time"
              value={timeOfDay}
              onChange={(event) => setTimeOfDay(event.target.value)}
            />
          </div>
          <Button onClick={addSchedule} disabled={isSaving || !supplement.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            {isSaving ? "Adding..." : "Add dose schedule"}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>

        {!isPremium && items.length >= 1 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <Card className="w-full max-w-xs rounded-2xl border-accent bg-card">
              <CardContent className="space-y-3 p-5 text-center">
                <p className="font-display text-xl text-foreground">
                  Unlock dosing reminders with Premium
                </p>
                <p className="text-sm text-muted-foreground">
                  Free plan includes one active dose schedule. Upgrade for unlimited schedules.
                </p>
                <Button asChild className="w-full">
                  <a href="/pricing">Upgrade to Premium</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

