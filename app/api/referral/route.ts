import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/auth-tokens";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, referralCode: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const referralCode =
    user.referralCode ??
    (
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: generateReferralCode() },
      })
    ).referralCode;

  const rows = await prisma.referral.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      invitedEmail: true,
      redeemedById: true,
      redeemedAt: true,
      createdAt: true,
    },
    take: 100,
  });

  const invitesSent = rows.length;
  const signups = rows.filter((row) => Boolean(row.redeemedById)).length;
  const rewardsEarned = signups;

  return NextResponse.json({
    code: referralCode,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${referralCode}`,
    stats: {
      invitesSent,
      signups,
      rewardsEarned,
      progressToThreeMonths: Math.min(100, Math.round((rewardsEarned / 3) * 100)),
    },
    recent: rows,
  });
}
