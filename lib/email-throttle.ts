import { prisma } from "@/lib/prisma";

export type EmailType = "health-alert" | "weekly-checkin" | "email-drip";

/**
 * Email consolidation logic to prevent spam
 * 
 * PRIORITY HIERARCHY:
 * 1. Health alerts (always send - safety critical)
 * 2. Weekly check-in (skip if health alert sent in past 7 days)
 * 3. Email drip (skip if any other email sent in past 24 hours OR weekly check-in completed in past 7 days)
 */
export async function canSendEmail(
  userId: string,
  emailType: EmailType
): Promise<{ canSend: boolean; reason?: string }> {
  const now = new Date();

  // Health alerts: ALWAYS send (highest priority, safety-critical)
  if (emailType === "health-alert") {
    return { canSend: true };
  }

  // Weekly check-in: SKIP if user received a health-alert in the past 7 days
  if (emailType === "weekly-checkin") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentHealthAlert = await prisma.emailLog.findFirst({
      where: {
        userId,
        emailType: "health-alert",
        sentAt: { gte: sevenDaysAgo },
      },
      orderBy: { sentAt: "desc" },
    });

    if (recentHealthAlert) {
      return {
        canSend: false,
        reason: `Health alert sent ${Math.round((now.getTime() - recentHealthAlert.sentAt.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
      };
    }

    return { canSend: true };
  }

  // Email drip: SKIP if any other email sent in past 24 hours OR weekly check-in completed in past 7 days
  if (emailType === "email-drip") {
    // Check for any email in past 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentEmail = await prisma.emailLog.findFirst({
      where: {
        userId,
        emailType: { in: ["health-alert", "weekly-checkin"] },
        sentAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { sentAt: "desc" },
    });

    if (recentEmail) {
      return {
        canSend: false,
        reason: `${recentEmail.emailType} sent ${Math.round((now.getTime() - recentEmail.sentAt.getTime()) / (1000 * 60 * 60))}h ago`,
      };
    }

    // Check if user completed a weekly check-in in past 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentCheckIn = await prisma.weeklyCheckIn.findFirst({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCheckIn) {
      return {
        canSend: false,
        reason: `User completed weekly check-in ${Math.round((now.getTime() - recentCheckIn.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
      };
    }

    return { canSend: true };
  }

  // Unknown email type - default to blocking
  return { canSend: false, reason: "Unknown email type" };
}

/**
 * Log an email send for throttling purposes
 */
export async function logEmailSent(userId: string, emailType: EmailType): Promise<void> {
  await prisma.emailLog.create({
    data: {
      userId,
      emailType,
    },
  });
}

/**
 * Get recent email log summary for debugging
 */
export async function getRecentEmailLogs(userId: string, days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return prisma.emailLog.findMany({
    where: {
      userId,
      sentAt: { gte: since },
    },
    orderBy: { sentAt: "desc" },
  });
}
