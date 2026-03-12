import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/meta-retention?secret=YOUR_CRON_SECRET
 * Returns Meta ad retention stats. No admin login needed.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = searchParams.get("since") ?? "2026-02-28";
  const metaSince = new Date(since);

  const metaCohort = await prisma.user.findMany({
    where: { createdAt: { gte: metaSince } },
    select: {
      id: true,
      email: true,
      createdAt: true,
      pets: {
        select: {
          _count: {
            select: {
              healthLogs: true,
              weeklyCheckIns: true,
              gutHealthLogs: true,
            },
          },
        },
      },
    },
  });

  const getHealthCount = (u: (typeof metaCohort)[0]) =>
    u.pets.reduce(
      (s, p) =>
        s +
        p._count.healthLogs +
        p._count.weeklyCheckIns +
        p._count.gutHealthLogs,
      0
    );

  const logged2Plus = metaCohort.filter((u) => getHealthCount(u) > 1).length;
  const logged1 = metaCohort.filter((u) => getHealthCount(u) === 1).length;
  const neverLogged = metaCohort.filter((u) => getHealthCount(u) === 0).length;

  const interpretation =
    metaCohort.length === 0
      ? "No signups in this period."
      : logged2Plus >= metaCohort.length * 0.7
        ? "Distribution problem: find more of these people."
        : "Product/retention problem: deliver value faster.";

  return NextResponse.json({
    since: since,
    total: metaCohort.length,
    logged2Plus,
    logged1,
    neverLogged,
    interpretation,
  });
}
