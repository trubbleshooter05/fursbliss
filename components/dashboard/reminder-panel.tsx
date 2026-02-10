"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ReminderPanelProps = {
  notifications: { id: string; title: string; body: string }[];
};

type DueDoseItem = {
  id: string;
  petId: string;
  petName: string;
  supplementName: string;
  dosage: string;
  frequency: string;
  times: unknown;
  status: "due" | "completed" | "skipped";
};

export function ReminderPanel({ notifications }: ReminderPanelProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dueItems, setDueItems] = useState<DueDoseItem[]>([]);
  const [isLoadingDue, setIsLoadingDue] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadDueItems = async () => {
    setIsLoadingDue(true);
    try {
      const response = await fetch("/api/doses/today");
      if (!response.ok) {
        throw new Error("Unable to load due doses.");
      }
      const data = await response.json();
      setDueItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setDueItems([]);
    } finally {
      setIsLoadingDue(false);
    }
  };

  useEffect(() => {
    void loadDueItems();
  }, []);

  const handleRun = async () => {
    setIsLoading(true);
    const response = await fetch("/api/reminders/run", { method: "POST" });
    setIsLoading(false);

    if (!response.ok) {
      toast({
        title: "Unable to run reminders",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Reminders generated" });
    window.location.reload();
  };

  const completeDose = async (scheduleId: string, skipped = false) => {
    setActioningId(scheduleId);
    const response = await fetch("/api/doses/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId, skipped }),
    });
    setActioningId(null);

    if (!response.ok) {
      toast({
        title: "Unable to update dose",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: skipped ? "Dose marked skipped" : "Dose marked completed" });
    await loadDueItems();
  };

  const formatTimes = (times: unknown) => {
    if (Array.isArray(times)) {
      return times.filter((item) => typeof item === "string").join(", ");
    }
    return "Any time";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Today&apos;s dose checklist</p>
        {isLoadingDue ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading doses...</p>
        ) : dueItems.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No dose schedules due today.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {dueItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    {item.petName}: {item.supplementName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.status === "due"
                      ? "Due"
                      : item.status === "completed"
                      ? "Completed"
                      : "Skipped"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.dosage} • {item.frequency} • {formatTimes(item.times)}
                </p>
                {item.status === "due" && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => completeDose(item.id, false)}
                      disabled={actioningId === item.id}
                    >
                      Took dose
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeDose(item.id, true)}
                      disabled={actioningId === item.id}
                    >
                      Skip
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Generate your daily supplement reminders.
        </p>
        <Button variant="outline" onClick={handleRun} disabled={isLoading}>
          {isLoading ? "Running..." : "Run reminders"}
        </Button>
      </div>
      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-muted-foreground">
          No reminders yet. Add supplement schedules in your pet profile.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-slate-100 bg-white px-4 py-3"
            >
              <p className="text-sm font-semibold text-slate-900">
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {notification.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
