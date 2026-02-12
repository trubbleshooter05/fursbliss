import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawCode = searchParams.get("code")?.trim().toUpperCase();
  if (!rawCode) {
    return NextResponse.json({ valid: false, message: "Referral code is required" }, { status: 400 });
  }

  const owner = await prisma.user.findUnique({
    where: { referralCode: rawCode },
    select: { id: true, name: true },
  });

  if (!owner) {
    return NextResponse.json({ valid: false, message: "Referral code not found" }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    code: rawCode,
    referrerName: owner.name ?? "FursBliss member",
  });
}
