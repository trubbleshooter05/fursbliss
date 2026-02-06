"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ReminderPanelProps = {
  notifications: { id: string; title: string; body: string }[];
};

export function ReminderPanel({ notifications }: ReminderPanelProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="space-y-4">
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
