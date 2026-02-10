import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  token: z.string().min(1),
  comment: z.string().trim().min(5).max(2000),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  const link = await prisma.vetShareLink.findUnique({
    where: { token: parsed.data.token },
    select: { id: true, expiresAt: true },
  });
  if (!link) {
    return NextResponse.json({ message: "Link not found" }, { status: 404 });
  }
  if (link.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ message: "Link has expired" }, { status: 410 });
  }

  await prisma.vetShareLink.update({
    where: { id: link.id },
    data: { vetComment: parsed.data.comment },
  });

  return NextResponse.json({ success: true });
}
