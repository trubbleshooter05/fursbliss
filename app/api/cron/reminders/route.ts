import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeEmailPreferences } from "@/lib/email-preferences";
import { sendReminderEmail } from "@/lib/email";

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const url = new URL(request.url);
  const secret = bearer ?? url.searchParams.get("secret");
  return secret && secret === process.env.CRON_SECRET;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      emailPreferences: true,
    },
  });

  let notificationsCreated = 0;
  let emailsQueued = 0;

  for (const user of users) {
    const preferences = normalizeEmailPreferences(user.emailPreferences);
    const schedules = await prisma.doseSchedule.findMany({
      where: { pet: { userId: user.id }, active: true },
      include: { pet: true },
    });
    const logCountToday = await prisma.healthLog.count({
      where: {
        pet: { userId: user.id },
        date: { gte: today },
      },
    });

    const notifications = schedules.map((schedule) => ({
      userId: user.id,
      type: "dose_reminder",
      title: `Dose reminder for ${schedule.pet.name}`,
      body: `Give ${schedule.supplementName} (${schedule.dosage}) today.`,
    }));

    if (logCountToday === 0) {
      notifications.push({
        userId: user.id,
        type: "daily_log",
        title: "Daily log reminder",
        body: "Log your pet's wellness check for today.",
      });
    }

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
      notificationsCreated += notifications.length;
    }

    if (preferences.doseReminders || preferences.dailyLogReminder) {
      const bodyLines: string[] = [];

      if (preferences.doseReminders && schedules.length > 0) {
        bodyLines.push(
          ...schedules.map(
            (schedule) =>
              `${schedule.pet.name}: ${schedule.supplementName} (${schedule.dosage})`
          )
        );
      }

      if (preferences.dailyLogReminder && logCountToday === 0) {
        bodyLines.push("Daily log: add today’s wellness check.");
      }

      if (bodyLines.length > 0) {
        const emailResult = await sendReminderEmail(
          user.email,
          "Your FursBliss reminders",
          bodyLines
        );
        if (emailResult.queued) {
          emailsQueued += 1;
        }
      }
    }
  }

  return NextResponse.json({
    usersProcessed: users.length,
    notificationsCreated,
    emailsQueued,
  });
}
