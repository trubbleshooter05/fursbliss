import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Unread warning/urgent proactive alerts (for nav badge) */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const unreadUrgent = await prisma.healthAlert.count({
    where: {
      userId: session.user.id,
      read: false,
      severity: { in: ["warning", "urgent"] },
    },
  });

  const totalUnread = await prisma.healthAlert.count({
    where: {
      userId: session.user.id,
      read: false,
    },
  });

  return NextResponse.json({
    unreadUrgent,
    totalUnread,
  });
}
