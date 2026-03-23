import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyHealthReminderEmail } from "@/lib/email";

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

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      emailPreferences: true,
    },
  });

  const users = allUsers.filter((u) => {
    const p = u.emailPreferences as { dailyReminder?: boolean } | null;
    return p?.dailyReminder === true;
  });

  let emailsQueued = 0;

  for (const user of users) {
    const prefs = user.emailPreferences as { reminderPetId?: string } | null;
    const petId = prefs?.reminderPetId;

    const logCountToday = await prisma.healthLog.count({
      where: {
        pet: { userId: user.id },
        date: { gte: today },
      },
    });

    if (logCountToday > 0) continue;

    // Skip if any other email sent today (daily reminder is lowest priority)
    const anyEmailToday = await prisma.emailLog.findFirst({
      where: {
        userId: user.id,
        sentAt: { gte: today },
      },
    });
    if (anyEmailToday) continue;

    const pet = petId
      ? await prisma.pet.findFirst({
          where: { id: petId, userId: user.id },
          select: { name: true },
        })
      : await prisma.pet.findFirst({
          where: { userId: user.id },
          select: { name: true },
        });

    const petName = pet?.name ?? "your pet";

    // Get last log date for 3+ days variant
    const lastLog = await prisma.healthLog.findFirst({
      where: { pet: { userId: user.id } },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    const daysSinceLastLog = lastLog
      ? Math.floor((today.getTime() - lastLog.date.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    try {
      const result = await sendDailyHealthReminderEmail(user.email, petName, {
        daysSinceLastLog: daysSinceLastLog ?? 0,
        lastLogDate: lastLog?.date,
      });
      if (result.queued) {
        await prisma.emailLog.create({
          data: { userId: user.id, emailType: "daily-reminder" },
        });
        emailsQueued += 1;
      }
    } catch (e) {
      console.error(`Daily reminder email failed for ${user.email}:`, e);
    }
  }

  return NextResponse.json({
    usersProcessed: users.length,
    emailsQueued,
  });
}
