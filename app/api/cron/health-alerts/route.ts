import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { calculateHealthScore, getHealthFlags } from "@/lib/health-score";
import type { HealthLogEntry, HealthFlag } from "@/lib/health-score";
import { HealthAlertEmail } from "@/components/emails/health-alert-email";

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

  console.log("[Health Alerts] Starting daily health alerts cron job");

  try {
    // Get all premium users
    const premiumUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: "premium",
        emailPreferences: {
          path: ["healthAlerts"],
          not: false, // Only users who haven't disabled health alerts
        },
      },
      include: {
        pets: {
          include: {
            healthLogs: {
              orderBy: { date: "desc" },
              take: 60, // Last 60 days for trend analysis
            },
          },
        },
      },
    });

    console.log(`[Health Alerts] Found ${premiumUsers.length} premium users`);

    let emailsSent = 0;
    let alertsGenerated = 0;

    for (const user of premiumUsers) {
      // Skip if user has no email
      if (!user.email) continue;

      // Process each of their pets
      for (const pet of user.pets) {
        const healthLogs = pet.healthLogs.map((log) => ({
          id: pet.id,
          date: log.date,
          energyLevel: log.energyLevel,
          appetite: log.appetite,
          appetiteLevel: log.appetiteLevel,
          mobilityLevel: log.mobilityLevel,
          weight: log.weight,
          symptoms: log.symptoms,
        })) as HealthLogEntry[];

        // Skip if not enough data
        if (healthLogs.length < 3) continue;

        // Calculate current and previous health scores
        const currentScore = calculateHealthScore(healthLogs);
        const previousScore = calculateHealthScore(healthLogs.slice(1)); // Yesterday's data

        if (!currentScore || !previousScore) continue;

        const scoreChange = currentScore.score - previousScore.score;

        // Get current health flags
        const flags = getHealthFlags(healthLogs, pet);

        // Determine if we should send an alert
        const hasRedFlags = flags.some((f) => f.type === "red");
        const significantScoreChange = Math.abs(scoreChange) >= 10;
        const hasNewYellowFlags = flags.filter((f) => f.type === "yellow").length > 0;

        const shouldSendAlert =
          hasRedFlags || significantScoreChange || (hasNewYellowFlags && scoreChange < -5);

        if (!shouldSendAlert) continue;

        // Create alert notification in database
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "health_alert",
            title: `Health update for ${pet.name}`,
            body:
              hasRedFlags
                ? `🔴 Urgent: ${pet.name} has red flag alerts that need attention.`
                : significantScoreChange
                  ? `Health score ${scoreChange > 0 ? "improved" : "declined"} by ${Math.abs(scoreChange)} points.`
                  : `⚠️ New patterns detected for ${pet.name}.`,
            read: false,
          },
        });

        alertsGenerated++;

        // Send email alert
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "FursBliss <alerts@fursbliss.com>",
            to: user.email,
            subject: hasRedFlags
              ? `⚠️ Urgent health alert for ${pet.name}`
              : `Health update for ${pet.name}`,
            react: HealthAlertEmail({
              userName: user.name?.split(" ")[0] || "there",
              petName: pet.name,
              petBreed: pet.breed,
              oldScore: previousScore.score,
              newScore: currentScore.score,
              scoreTrend: currentScore.trend,
              flags: flags.map(f => ({ id: `${pet.id}-${f.title}`, type: f.type, title: f.title, description: f.description })),
              dashboardUrl,
            }),
          });

          emailsSent++;
          console.log(`[Health Alerts] Sent alert to ${user.email} for ${pet.name}`);
        } catch (emailError) {
          console.error(
            `[Health Alerts] Failed to send email to ${user.email}:`,
            emailError
          );
        }
      }
    }

    console.log(
      `[Health Alerts] Completed: ${emailsSent} emails sent, ${alertsGenerated} alerts created`
    );

    return NextResponse.json({
      success: true,
      premiumUsers: premiumUsers.length,
      alertsGenerated,
      emailsSent,
    });
  } catch (error) {
    console.error("[Health Alerts] Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
