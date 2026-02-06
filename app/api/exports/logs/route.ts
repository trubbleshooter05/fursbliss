import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
