import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mergeEmailPreferences, normalizeEmailPreferences } from "@/lib/email-preferences";

const updateSchema = z.object({
  doseReminders: z.boolean().optional(),
  dailyLogReminder: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  fdaUpdates: z.boolean().optional(),
  referralNotifications: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailPreferences: true },
  });

  return NextResponse.json({
    preferences: normalizeEmailPreferences(user?.emailPreferences ?? null),
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid preferences" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailPreferences: true },
  });

  const merged = mergeEmailPreferences(user?.emailPreferences ?? null, parsed.data);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailPreferences: merged },
  });

  return NextResponse.json({ preferences: merged });
}
