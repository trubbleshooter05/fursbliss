import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(request, `export-logs:${session.user.id}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many export requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
        },
      }
    );
  }

  const logs = await prisma.healthLog.findMany({
    where: { pet: { userId: session.user.id } },
    include: { pet: true },
    orderBy: { date: "desc" },
  });

  const header = [
    "Pet",
    "Date",
    "Energy",
    "Mood",
    "Appetite",
    "Weight",
    "Notes",
    "Improvements",
  ];

  const rows = logs.map((log) => [
    log.pet.name,
    log.date.toISOString(),
    log.energyLevel,
    log.mood ?? "",
    log.appetite ?? "",
    log.weight ?? "",
    log.notes ?? "",
    log.improvements ? "Yes" : "No",
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=fursbliss-logs.csv",
    },
  });
}
