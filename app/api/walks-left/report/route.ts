import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  source: z.literal("walks-left").optional(),
  dogName: z.string().trim().min(1).max(64),
  breed: z.string().trim().min(2).max(80),
  ageYears: z.number().int().min(0).max(30),
  ageMonths: z.number().int().min(0).max(11),
  expectancy: z.object({
    low: z.number().min(1).max(25),
    mid: z.number().min(1).max(25),
    high: z.number().min(1).max(25),
  }),
  metrics: z.object({
    walksLeft: z.number().int().min(0),
    weekendsLeft: z.number().int().min(0),
    sunsetsLeft: z.number().int().min(0),
    carRidesLeft: z.number().int().min(0),
    couchHoursLeft: z.number().int().min(0),
    heartbeatsMillions: z.number().min(0),
    bellyRubsLeft: z.number().int().min(0),
    morningGreetingsLeft: z.number().int().min(0),
  }),
});

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
}

async function addToWaitlist(email: string) {
  try {
    await prisma.waitlistSignup.create({
      data: {
        email,
        source: "walks-left",
      },
    });
    return { duplicate: false };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { duplicate: true };
    }
    throw error;
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  try {
    await addToWaitlist(parsed.data.email);

    if (process.env.RESEND_API_KEY) {
      const reportUrl = `${appUrl()}/walks-left?name=${encodeURIComponent(
        parsed.data.dogName
      )}&breed=${encodeURIComponent(parsed.data.breed)}`;
      const subject = `${parsed.data.dogName}'s Walks Left Report`;
      const text = `${parsed.data.dogName}'s estimated moments ahead:

Walks left: ${parsed.data.metrics.walksLeft.toLocaleString()}
Sunsets left: ${parsed.data.metrics.sunsetsLeft.toLocaleString()}
Weekends left: ${parsed.data.metrics.weekendsLeft.toLocaleString()}
Car rides left: ${parsed.data.metrics.carRidesLeft.toLocaleString()}
Couch hours left: ${parsed.data.metrics.couchHoursLeft.toLocaleString()}
Heartbeats left: ${parsed.data.metrics.heartbeatsMillions.toFixed(1)} million

Based on average ${parsed.data.breed} life expectancy of ${parsed.data.expectancy.low}-${parsed.data.expectancy.high} years.

Run the full longevity quiz: ${appUrl()}/quiz
Track LOY-002 timeline updates: ${appUrl()}/longevity-drugs
Open your card again: ${reportUrl}`;
      const html = `<div style="font-family: Arial, sans-serif; color: #111827;">
        <h2>${parsed.data.dogName}'s Walks Left Report</h2>
        <p>Here is your personalized snapshot:</p>
        <ul>
          <li><strong>${parsed.data.metrics.walksLeft.toLocaleString()}</strong> more walks</li>
          <li><strong>${parsed.data.metrics.sunsetsLeft.toLocaleString()}</strong> more sunsets</li>
          <li><strong>${parsed.data.metrics.weekendsLeft.toLocaleString()}</strong> more weekends</li>
          <li><strong>${parsed.data.metrics.carRidesLeft.toLocaleString()}</strong> more car rides</li>
          <li><strong>${parsed.data.metrics.couchHoursLeft.toLocaleString()}</strong> more couch hours together</li>
          <li><strong>${parsed.data.metrics.heartbeatsMillions.toFixed(1)} million</strong> more heartbeats</li>
        </ul>
        <p style="font-size: 13px; color: #4B5563;">
          Based on average ${parsed.data.breed} life expectancy of ${parsed.data.expectancy.low}-${parsed.data.expectancy.high} years.
        </p>
        <p>
          <a href="${appUrl()}/quiz" style="color:#0D6E6E;font-weight:600;">Take the full longevity quiz</a>
          <br/>
          <a href="${appUrl()}/longevity-drugs" style="color:#0D6E6E;font-weight:600;">Track LOY-002 timeline updates</a>
          <br/>
          <a href="${reportUrl}" style="color:#0D6E6E;font-weight:600;">Open your Walks Left card</a>
        </p>
      </div>`;

      await sendEmail({
        to: parsed.data.email,
        subject,
        text,
        html,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("walks-left report error", error);
    return NextResponse.json(
      { ok: false, message: "Unable to send report right now." },
      { status: 500 }
    );
  }
}
