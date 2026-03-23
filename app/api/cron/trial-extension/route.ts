import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const url = new URL(request.url);
  const secret = bearer ?? url.searchParams.get("secret");
  return secret && secret === process.env.CRON_SECRET;
}

/** Award 1 extra month of premium to users who logged 20+ days in their first 30 days. One-time only. */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Users who signed up 30+ days ago, are free, never paid, and haven't received trial extension
  // (subscriptionPlan stays "trial_extension" after expiry so we don't re-award)
  const candidates = await prisma.user.findMany({
    where: {
      createdAt: { lte: thirtyDaysAgo },
      subscriptionStatus: "free",
      stripeCustomerId: null,
      subscriptionPlan: { not: "trial_extension" },
    },
    select: {
      id: true,
      createdAt: true,
      emailPreferences: true,
    },
  });

  let awarded = 0;

  for (const user of candidates) {
    const signupDate = user.createdAt;
    const first30DaysEnd = new Date(signupDate);
    first30DaysEnd.setDate(first30DaysEnd.getDate() + 30);

    const logsInFirst30 = await prisma.healthLog.findMany({
      where: {
        pet: { userId: user.id },
        date: { gte: signupDate, lt: first30DaysEnd },
      },
      select: { date: true },
    });
    const loggedDaysInFirst30 = new Set(
      logsInFirst30.map((l) => l.date.toISOString().slice(0, 10))
    ).size;

    // Require 20+ unique days logged in first 30 days
    if (loggedDaysInFirst30 < 20) continue;

    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + 30);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "premium",
        subscriptionPlan: "trial_extension",
        subscriptionEndsAt: endsAt,
        subscriptionId: null,
      },
    });

    awarded += 1;
  }

  return NextResponse.json({
    candidatesChecked: candidates.length,
    awarded,
  });
}
