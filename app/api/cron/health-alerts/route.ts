import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { runHealthAlertEngineForAllEligiblePets } from "@/lib/health-alerts/engine";
import { ProactiveHealthAlertEmail } from "@/components/emails/proactive-health-alert-email";
import { logEmailSent } from "@/lib/email-throttle";
import { isEffectivePremium } from "@/lib/subscription";

const resend = new Resend(process.env.RESEND_API_KEY);

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  console.log("[Health Alerts] Proactive engine cron start");

  try {
    const { petsProcessed, alertsCreated } = await runHealthAlertEngineForAllEligiblePets();

    const newAlerts = await prisma.healthAlert.findMany({
      where: { createdAt: { gte: startedAt } },
      include: {
        pet: { select: { name: true, breed: true } },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            subscriptionEndsAt: true,
            emailPreferences: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    let notificationsCreated = 0;
    let emailsSent = 0;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";

    for (const a of newAlerts) {
      if (a.severity === "warning" || a.severity === "urgent") {
        await prisma.notification.create({
          data: {
            userId: a.userId,
            type: "proactive_health_alert",
            title: a.title,
            body:
              a.severity === "urgent"
                ? `🔴 ${a.title}`
                : `⚠️ ${a.title}`,
            read: false,
            actionUrl: `/pets/${a.petId}`,
          },
        });
        notificationsCreated++;
      }

      const premium = isEffectivePremium(a.user);
      const wantsEmail = (a.user.emailPreferences as { healthAlerts?: boolean } | null)?.healthAlerts !== false;

      if (
        premium &&
        wantsEmail &&
        (a.severity === "warning" || a.severity === "urgent") &&
        !a.emailSent
      ) {
        const trend = (a.trendData as { current7day?: number; previous7day?: number; change?: number } | null) ?? {};
        const currentAvg = trend.current7day ?? 0;
        const previousAvg = trend.previous7day ?? 0;
        const pct =
          trend.change != null
            ? Math.abs(trend.change)
            : previousAvg > 0
              ? Math.abs(((previousAvg - currentAvg) / previousAvg) * 100)
              : 0;

        const metricLabel = a.metric ?? "health";

        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "FursBliss <alerts@fursbliss.com>",
            to: a.user.email!,
            subject: `⚠️ ${a.pet.name}'s ${metricLabel} — update from FursBliss`,
            react: ProactiveHealthAlertEmail({
              userName: a.user.name?.split(" ")[0] ?? "there",
              petName: a.pet.name,
              petBreed: a.pet.breed,
              metricLabel,
              pctChange: pct,
              currentAvg,
              previousAvg,
              recommendation: a.recommendation,
              breedNote:
                a.alertType === "breed_risk"
                  ? a.message
                  : undefined,
              reportUrl: `${appUrl}/pets/${a.petId}`,
            }),
          });

          await prisma.healthAlert.update({
            where: { id: a.id },
            data: { emailSent: true },
          });

          await logEmailSent(a.userId, "health-alert");
          emailsSent++;
        } catch (e) {
          console.error("[Health Alerts] Email failed", a.id, e);
        }
      }
    }

    console.log(
      `[Health Alerts] Done: pets=${petsProcessed} alerts=${alertsCreated} notify=${notificationsCreated} emails=${emailsSent}`
    );

    return NextResponse.json({
      success: true,
      petsProcessed,
      alertsCreated,
      newAlertRows: newAlerts.length,
      notificationsCreated,
      emailsSent,
    });
  } catch (error) {
    console.error("[Health Alerts] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
