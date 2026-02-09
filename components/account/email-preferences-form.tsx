"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { EmailPreferences } from "@/types/email-preferences";

type EmailPreferencesFormProps = {
  initialPreferences: EmailPreferences;
};

const preferenceOptions: Array<{
  key: keyof EmailPreferences;
  label: string;
  description: string;
}> = [
  {
    key: "doseReminders",
    label: "Dose reminders",
    description: "Get daily supplement schedule reminders.",
  },
  {
    key: "dailyLogReminder",
    label: "Daily log reminder",
    description: "A nudge if you haven't logged wellness today.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly health summary",
    description: "A weekly snapshot of scores and trends.",
  },
  {
    key: "fdaUpdates",
    label: "Longevity drug updates",
    description: "LOY-002 and FDA milestone updates.",
  },
  {
    key: "referralNotifications",
    label: "Referral updates",
    description: "When a friend signs up or redeems your code.",
  },
];

export function EmailPreferencesForm({ initialPreferences }: EmailPreferencesFormProps) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<EmailPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const updatePreference = async (key: keyof EmailPreferences, value: boolean) => {
    const nextPreferences = { ...preferences, [key]: value };
    setPreferences(nextPreferences);
    setIsSaving(true);

    try {
      const response = await fetch("/api/account/email-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to update preferences");
      }

      if (data?.preferences) {
        setPreferences(data.preferences);
      }

      toast({ title: "Preferences updated" });
    } catch (error) {
      setPreferences(preferences);
      toast({
        title: "Unable to update",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {preferenceOptions.map((option) => (
        <label
          key={option.key}
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
        >
          <Checkbox
            checked={preferences[option.key]}
            disabled={isSaving}
            onCheckedChange={(checked) =>
              updatePreference(option.key, checked === true)
            }
          />
          <span className="space-y-1">
            <span className="block font-medium text-slate-900">
              {option.label}
            </span>
            <span className="block text-xs text-muted-foreground">
              {option.description}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}
