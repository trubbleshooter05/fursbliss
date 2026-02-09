export type EmailPreferences = {
  doseReminders: boolean;
  dailyLogReminder: boolean;
  weeklyDigest: boolean;
  fdaUpdates: boolean;
  referralNotifications: boolean;
};

export const defaultEmailPreferences: EmailPreferences = {
  doseReminders: true,
  dailyLogReminder: true,
  weeklyDigest: true,
  fdaUpdates: true,
  referralNotifications: true,
};
