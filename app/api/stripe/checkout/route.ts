import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";
import { sendServerMetaEvent } from "@/lib/meta-capi";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
}

function sanitizePath(pathValue: string | null, fallback: string): string {
  if (!pathValue) return fallback;
  if (!pathValue.startsWith("/") || pathValue.startsWith("//")) return fallback;
  return pathValue;
}

function appendQuery(pathValue: string, key: string, value: string): string {
  const joiner = pathValue.includes("?") ? "&" : "?";
  return `${pathValue}${joiner}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const requestedPlan = searchParams.get("plan");
  const requestedPriceId = searchParams.get("priceId");
  const source = searchParams.get("source") ?? "pricing";
  const returnTo = sanitizePath(searchParams.get("returnTo"), "/account?success=true");
  const cancelTo = sanitizePath(searchParams.get("cancelTo"), "/pricing");
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "anon";

  const limiter = rateLimit(request, userId ? `stripe-checkout:${userId}` : `stripe-checkout:guest:${ip}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!limiter.success) {
    return NextResponse.json(
      { message: "Too many checkout attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(getRetryAfterSeconds(limiter.resetAt)),
        },
      }
    );
  }

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
      })
    : null;

  let customerId = user?.stripeCustomerId ?? null;

  if (customerId) {
    try {
      const existing = await stripe.customers.retrieve(customerId);
      if (existing && typeof existing !== "string" && existing.deleted) {
        customerId = null;
      }
    } catch (error) {
      customerId = null;
    }
  }

  if (user && !customerId) {
    customerId = (
      await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
      })
    ).id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const monthlyPriceId =
    process.env.STRIPE_PRICE_ID_MONTHLY ??
    process.env.STRIPE_PRICE_MONTHLY ??
    process.env.STRIPE_PRICE_ID;
  const annualPriceId = process.env.STRIPE_PRICE_ID_ANNUAL ?? process.env.STRIPE_PRICE_YEARLY;

  const plan = requestedPlan === "yearly" ? "yearly" : "monthly";
  let priceId = plan === "yearly" ? annualPriceId : monthlyPriceId;

  if (requestedPriceId) {
    const knownPriceIds = [monthlyPriceId, annualPriceId].filter(
      (value): value is string => Boolean(value)
    );
    if (!knownPriceIds.includes(requestedPriceId)) {
      return NextResponse.json({ message: "Invalid Stripe price selected" }, { status: 400 });
    }
    priceId = requestedPriceId;
  }

  if (!priceId) {
    return NextResponse.json({ message: "Stripe price not configured" }, { status: 500 });
  }

  const selectedPlan = priceId === annualPriceId ? "yearly" : "monthly";
  const successPath = appendQuery(returnTo, "session_id", "{CHECKOUT_SESSION_ID}");
  const guestSuccessPath = `/signup?checkout=success&session_id={CHECKOUT_SESSION_ID}&redirect=${encodeURIComponent(
    returnTo
  )}`;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { plan: selectedPlan, source },
    success_url: `${appUrl()}${user ? successPath : guestSuccessPath}`,
    cancel_url: `${appUrl()}${cancelTo}`,
  });

  // Send server-side Meta CAPI event for triage/quiz upgrade clicks
  if (source && (source.includes("triage") || source.includes("quiz"))) {
    void sendServerMetaEvent("TriageClickedUpgrade", {
      email: user?.email,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
          request.headers.get("x-real-ip")?.trim() || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      customData: {
        source,
        plan: selectedPlan,
        value: selectedPlan === "yearly" ? 59 : 9,
      },
      sourceUrl: `${appUrl()}${source.includes("triage") ? "/triage" : "/quiz"}`,
    });
  }

  if (!checkoutSession.url) {
    return NextResponse.json({ message: "Unable to create checkout session" }, { status: 500 });
  }

  return NextResponse.redirect(checkoutSession.url, { status: 303 });
}
