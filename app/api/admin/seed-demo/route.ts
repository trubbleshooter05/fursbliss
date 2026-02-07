import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const limiter = rateLimit(request, "seed-demo", {
      limit: 3,
      windowMs: 60_000,
    });
    if (!limiter.success) {
      return NextResponse.json(
        { message: "Too many requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
          },
        }
      );
    }

    const secretHeader = request.headers.get("x-demo-seed-secret") ?? "";
    const seedSecret = process.env.DEMO_SEED_SECRET ?? "";
    if (!seedSecret || secretHeader !== seedSecret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = process.env.DEMO_EMAIL ?? "demo@fursbliss.com";
    const password = process.env.DEMO_PASSWORD ?? "premium129!";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        subscriptionStatus: "premium",
        emailVerified: new Date(),
        role: "admin",
      },
      create: {
        email,
        name: "FursBliss Demo",
        password: hashedPassword,
        subscriptionStatus: "premium",
        emailVerified: new Date(),
        role: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      email: user.email,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Seed demo error", message);
    return NextResponse.json(
      { message: "Unable to seed demo account.", error: message },
      { status: 500 }
    );
  }
}
