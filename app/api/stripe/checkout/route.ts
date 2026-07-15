import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";
import { sendServerMetaEvent } from "@/lib/meta-capi";
import { sendGa4ServerEvent } from "@/lib/ga4-server";
import {
  getAnnualPriceId,
  getMonthlyPriceId,
  getUrgentAnswerPriceId,
  parseCheckoutProduct,
  URGENT_ANSWER_PRICE_USD,
} from "@/lib/stripe-prices";

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
  const checkoutProduct = parseCheckoutProduct(searchParams.get("product"));
  const requestedPlan = searchParams.get("plan");
  const requestedPriceId = searchParams.get("priceId");
  const source = searchParams.get("source") ?? (checkoutProduct === "urgent_answer" ? "urgent" : "pricing");
  const defaultReturn =
    checkoutProduct === "urgent_answer" ? "/triage?urgent=ready" : "/account?success=true";
  const defaultCancel =
    checkoutProduct === "urgent_answer" ? "/check" : "/pricing";
  const returnTo = sanitizePath(searchParams.get("returnTo"), defaultReturn);
  let cancelTo = sanitizePath(searchParams.get("cancelTo"), defaultCancel);
  // Mark abandonments so /pricing can fire checkout_abandoned (no business logic change)
  if (!cancelTo.includes("checkout=")) {
    cancelTo = appendQuery(cancelTo, "checkout", "cancelled");
  }

  const utmSource = searchParams.get("utm_source") ?? "";
  const utmMedium = searchParams.get("utm_medium") ?? "";
  const utmCampaign = searchParams.get("utm_campaign") ?? "";
  const landingPage = searchParams.get("landing_page") ?? "";
  const referrer = searchParams.get("referrer") ?? "";
  const gaClientId = searchParams.get("ga_client_id") ?? "";
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
    } catch {
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

  const monthlyPriceId = getMonthlyPriceId();
  const annualPriceId = getAnnualPriceId();
  const urgentPriceId = getUrgentAnswerPriceId();

  const baseMetadata = {
    source,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    landing_page: landingPage,
    referrer,
    ga_client_id: gaClientId,
  };

  if (checkoutProduct === "urgent_answer") {
    if (!urgentPriceId) {
      return NextResponse.json({ message: "Urgent answer price not configured" }, { status: 500 });
    }

    const successPath = appendQuery(returnTo, "session_id", "{CHECKOUT_SESSION_ID}");
    const guestSuccessPath = `/signup?checkout=success&session_id={CHECKOUT_SESSION_ID}&product=urgent_answer&redirect=${encodeURIComponent(returnTo)}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId ?? undefined,
      customer_creation: customerId ? undefined : "always",
      line_items: [{ price: urgentPriceId, quantity: 1 }],
      metadata: {
        ...baseMetadata,
        product: "urgent_answer",
        plan: "urgent",
      },
      success_url: `${appUrl()}${user ? successPath : guestSuccessPath}`,
      cancel_url: `${appUrl()}${cancelTo}`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ message: "Unable to create checkout session" }, { status: 500 });
    }

    void sendGa4ServerEvent(
      "urgent_checkout_start",
      {
        source,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        checkout_session_id: checkoutSession.id,
      },
      gaClientId || undefined
    );
    void sendGa4ServerEvent(
      "checkout_started",
      {
        source_page: source,
        plan_name: "urgent_answer",
        price: URGENT_ANSWER_PRICE_USD,
        currency: "USD",
        value: URGENT_ANSWER_PRICE_USD,
        transaction_id: checkoutSession.id,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      },
      gaClientId || undefined
    );

    return NextResponse.redirect(checkoutSession.url, { status: 303 });
  }

  const plan = requestedPlan === "yearly" ? "yearly" : "monthly";
  let priceId = plan === "yearly" ? annualPriceId : monthlyPriceId;
  const introCouponId = process.env.STRIPE_INTRO_COUPON_ID;

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
  const guestSuccessPath = `/signup?checkout=success&session_id={CHECKOUT_SESSION_ID}&product=subscription&redirect=${encodeURIComponent(returnTo)}`;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    ...(plan === "monthly" && introCouponId
      ? { discounts: [{ coupon: introCouponId }] }
      : {}),
    subscription_data: {
      trial_period_days: 7,
      trial_settings: {
        end_behavior: { missing_payment_method: "cancel" },
      },
    },
    payment_method_collection: "always",
    metadata: {
      ...baseMetadata,
      product: "subscription",
      plan: selectedPlan,
    },
    success_url: `${appUrl()}${user ? successPath : guestSuccessPath}`,
    cancel_url: `${appUrl()}${cancelTo}`,
  });

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

  const priceValue = selectedPlan === "yearly" ? 59 : 9;
  void sendGa4ServerEvent(
    "checkout_started",
    {
      source_page: source,
      plan_name: selectedPlan,
      price: priceValue,
      currency: "USD",
      value: priceValue,
      transaction_id: checkoutSession.id,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    },
    gaClientId || undefined
  );

  return NextResponse.redirect(checkoutSession.url, { status: 303 });
}
