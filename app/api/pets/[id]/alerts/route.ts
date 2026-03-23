import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveSubscriptionStatus } from "@/lib/subscription";

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const petId = params.id;
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const severityFilter = searchParams.get("severity");

  const pet = await prisma.pet.findFirst({
    where: { id: petId, userId: session.user.id },
    select: { id: true },
  });
  if (!pet) {
    return NextResponse.json({ message: "Pet not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true, subscriptionPlan: true, subscriptionEndsAt: true },
  });
  const isPremium = getEffectiveSubscriptionStatus(user ?? {}) === "premium";

  const severities = severityFilter
    ? severityFilter.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const alerts = await prisma.healthAlert.findMany({
    where: {
      petId,
      ...(unreadOnly ? { read: false } : {}),
      ...(severities?.length ? { severity: { in: severities } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      alertType: true,
      severity: true,
      title: true,
      message: true,
      recommendation: true,
      metric: true,
      trendData: true,
      read: true,
      emailSent: true,
      createdAt: true,
    },
  });

  const payload = isPremium
    ? { isPremium: true, alerts }
    : {
        isPremium: false,
        alerts: alerts.map((a) => ({
          id: a.id,
          alertType: a.alertType,
          severity: a.severity,
          title: a.title,
          read: a.read,
          createdAt: a.createdAt,
          locked: true as const,
        })),
      };

  return NextResponse.json(payload);
}
