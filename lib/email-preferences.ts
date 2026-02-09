import { Prisma } from "@prisma/client";
import {
  defaultEmailPreferences,
  EmailPreferences,
} from "@/types/email-preferences";

export function normalizeEmailPreferences(
  value: Prisma.JsonValue | null | undefined
): EmailPreferences {
  if (!value || typeof value !== "object") {
    return { ...defaultEmailPreferences };
  }

  const prefs = value as Partial<EmailPreferences>;
  return {
    doseReminders: prefs.doseReminders ?? defaultEmailPreferences.doseReminders,
    dailyLogReminder:
      prefs.dailyLogReminder ?? defaultEmailPreferences.dailyLogReminder,
    weeklyDigest: prefs.weeklyDigest ?? defaultEmailPreferences.weeklyDigest,
    fdaUpdates: prefs.fdaUpdates ?? defaultEmailPreferences.fdaUpdates,
    referralNotifications:
      prefs.referralNotifications ??
      defaultEmailPreferences.referralNotifications,
  };
}

export function mergeEmailPreferences(
  current: Prisma.JsonValue | null | undefined,
  updates: Partial<EmailPreferences>
): EmailPreferences {
  const normalized = normalizeEmailPreferences(current);
  return { ...normalized, ...updates };
}
