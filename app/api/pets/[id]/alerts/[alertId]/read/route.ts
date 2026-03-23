import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: { id: string; alertId: string } };

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: petId, alertId } = params;

  const alert = await prisma.healthAlert.findFirst({
    where: { id: alertId, petId, userId: session.user.id },
  });
  if (!alert) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await prisma.healthAlert.update({
    where: { id: alertId },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
