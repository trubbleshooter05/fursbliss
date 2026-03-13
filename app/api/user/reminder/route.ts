import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  enabled: z.boolean(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  petId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, emailPreferences: true },
  });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const prefs = (user.emailPreferences as Record<string, unknown>) ?? {};
  const updated = {
    ...prefs,
    dailyReminder: parsed.data.enabled,
    reminderTime: parsed.data.time ?? "09:00",
    reminderPetId: parsed.data.petId ?? null,
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailPreferences: updated },
  });

  return NextResponse.json({ ok: true });
}
