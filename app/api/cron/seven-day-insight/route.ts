import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSevenDayInsightEmail } from "@/lib/email";

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

  // Find users who have 7+ logged days for their primary pet and haven't received the 7-day email
  const usersWithSevenDays = await prisma.user.findMany({
    where: {
      pets: {
        some: {},
      },
    },
    select: {
      id: true,
      email: true,
      pets: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          id: true,
          name: true,
          healthLogs: {
            select: {
              date: true,
              energyLevel: true,
              appetiteLevel: true,
              mobilityLevel: true,
            },
          },
        },
      },
    },
  });

  let emailsSent = 0;

  for (const user of usersWithSevenDays) {
    const email = user.email?.trim();
    if (!email) continue;

    const pet = user.pets[0];
    if (!pet) continue;

    const uniqueDates = new Set(
      pet.healthLogs.map((l) => l.date.toISOString().slice(0, 10))
    );
    if (uniqueDates.size < 7) continue;

    const alreadySent = await prisma.emailLog.findFirst({
      where: {
        userId: user.id,
        emailType: "seven-day-insight",
      },
    });
    if (alreadySent) continue;

    const logs = pet.healthLogs;
    const withEnergy = logs.filter((l) => l.energyLevel != null);
    const withAppetite = logs.filter((l) => l.appetiteLevel != null);
    const withMobility = logs.filter((l) => l.mobilityLevel != null);

    const avgEnergy =
      withEnergy.length > 0
        ? withEnergy.reduce((s, l) => s + (l.energyLevel ?? 0), 0) / withEnergy.length
        : 7;
    const avgAppetite =
      withAppetite.length > 0
        ? withAppetite.reduce((s, l) => s + (l.appetiteLevel ?? 0), 0) / withAppetite.length
        : 7;
    const avgMobility =
      withMobility.length > 0
        ? withMobility.reduce((s, l) => s + (l.mobilityLevel ?? 0), 0) / withMobility.length
        : 7;

    const sortedByDate = [...logs].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    const firstHalf = sortedByDate.slice(0, Math.ceil(sortedByDate.length / 2));
    const secondHalf = sortedByDate.slice(Math.ceil(sortedByDate.length / 2));
    const avgMobilityFirst =
      firstHalf.filter((l) => l.mobilityLevel != null).length > 0
        ? firstHalf
            .filter((l) => l.mobilityLevel != null)
            .reduce((s, l) => s + (l.mobilityLevel ?? 0), 0) /
          firstHalf.filter((l) => l.mobilityLevel != null).length
        : avgMobility;
    const avgMobilitySecond =
      secondHalf.filter((l) => l.mobilityLevel != null).length > 0
        ? secondHalf
            .filter((l) => l.mobilityLevel != null)
            .reduce((s, l) => s + (l.mobilityLevel ?? 0), 0) /
          secondHalf.filter((l) => l.mobilityLevel != null).length
        : avgMobility;
    const mobilityDipped = avgMobilitySecond < avgMobilityFirst - 0.5;

    try {
      const result = await sendSevenDayInsightEmail(email, pet.name, {
        avgEnergy,
        avgAppetite,
        avgMobility,
        mobilityDipped,
      });
      if (result.queued) {
        await prisma.emailLog.create({
          data: {
            userId: user.id,
            emailType: "seven-day-insight",
          },
        });
        emailsSent += 1;
      }
    } catch (e) {
      console.error(`Seven-day insight email failed for ${email}:`, e);
    }
  }

  return NextResponse.json({
    usersChecked: usersWithSevenDays.length,
    emailsSent,
  });
}
