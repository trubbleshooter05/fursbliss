import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimit, getRetryAfterSeconds } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const limiter = rateLimit(request, `stripe-checkout:${session.user.id}`, {
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  let customerId = user.stripeCustomerId ?? null;

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

  if (!customerId) {
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

  const { searchParams } = new URL(request.url);
  const requestedPlan = searchParams.get("plan");
  const requestedPriceId = searchParams.get("priceId");
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

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { plan: selectedPlan },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ message: "Unable to create checkout session" }, { status: 500 });
  }

  return NextResponse.redirect(checkoutSession.url, { status: 303 });
}
