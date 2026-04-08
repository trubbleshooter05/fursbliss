import { NextResponse } from "next/server";
import { reportCronFailure } from "@/lib/cron-monitoring";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { WeeklyCheckInEmail, WeeklyCheckInEmailText } from "@/components/emails/weekly-checkin-email";
import { canSendEmail, logEmailSent } from "@/lib/email-throttle";

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

  console.log("[Weekly Check-In] Starting Sunday 9am cron job");

  try {
    // Get all users with active pets (only send to users who have logged in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await prisma.user.findMany({
      where: {
        subscriptionStatus: "premium", // ONLY PREMIUM - Weekly check-ins are a retention feature
        updatedAt: {
          gte: thirtyDaysAgo,
        },
        emailPreferences: {
          path: ["weeklyCheckins"],
          not: false, // Only users who haven't disabled weekly check-ins
        },
        pets: {
          some: {
            isActive: true,
          },
        },
      },
      include: {
        pets: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "asc", // Prioritize oldest pet
          },
          take: 1, // Only send for primary pet
        },
      },
    });

    console.log(`[Weekly Check-In] Found ${users.length} eligible users`);

    let emailsSent = 0;
    let errors = 0;
    let skipped = 0;

    // Calculate current week start date (last Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysToMonday);
    lastMonday.setHours(0, 0, 0, 0);

    for (const user of users) {
      const pet = user.pets[0];
      if (!pet) continue;

      try {
        // Check if user already completed check-in for this week
        const existingCheckIn = await prisma.weeklyCheckIn.findFirst({
          where: {
            userId: user.id,
            petId: pet.id,
            weekStartDate: lastMonday,
          },
        });

        if (existingCheckIn) {
          console.log(`[Weekly Check-In] User ${user.email} already completed check-in for ${pet.name}`);
          skipped++;
          continue; // Skip if already completed
        }

        // Check email throttling (skip if health alert sent in past 7 days)
        const throttleCheck = await canSendEmail(user.id, "weekly-checkin");
        if (!throttleCheck.canSend) {
          console.log(`[Weekly Check-In] Skipping ${user.email}: ${throttleCheck.reason}`);
          skipped++;
          continue;
        }

        // Calculate week number
        const weeksSincePetAdded = Math.floor(
          (now.getTime() - pet.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        const weekNumber = weeksSincePetAdded + 1;

        // Generate check-in URL
        const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL}/weekly-checkin/${pet.id}`;

        // Send email using React component
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "FursBliss <hello@fursbliss.com>",
          to: user.email,
          subject: `How was ${pet.name}'s week?`,
          react: WeeklyCheckInEmail({
            userName: user.name || "there",
            dogName: pet.name,
            dogBreed: pet.breed,
            checkInUrl,
            weekNumber,
          }),
          text: WeeklyCheckInEmailText({
            userName: user.name || "there",
            dogName: pet.name,
            dogBreed: pet.breed,
            checkInUrl,
            weekNumber,
          }),
          headers: {
            "Idempotency-Key": `weekly-checkin-${user.id}-${pet.id}-${lastMonday.toISOString()}`,
          },
        });

        if (result.error) {
          console.error(`[Weekly Check-In] Error sending to ${user.email}:`, result.error);
          errors++;
        } else {
          console.log(`[Weekly Check-In] Sent to ${user.email} for ${pet.name}`);
          
          // Log email send for throttling
          await logEmailSent(user.id, "weekly-checkin");
          
          emailsSent++;
        }

        // Rate limit: wait 600ms between emails
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (error) {
        console.error(`[Weekly Check-In] Error processing user ${user.email}:`, error);
        errors++;
      }
    }

    console.log(`[Weekly Check-In] Completed: ${emailsSent} sent, ${skipped} skipped, ${errors} errors`);

    return NextResponse.json({
      success: true,
      emailsSent,
      skipped,
      errors,
      totalUsers: users.length,
    });
  } catch (error) {
    console.error("[Weekly Check-In] Cron job error:", error);
    reportCronFailure("weekly-checkin", error);
    return NextResponse.json(
      { message: "Cron job failed", error: String(error) },
      { status: 500 }
    );
  }
}
