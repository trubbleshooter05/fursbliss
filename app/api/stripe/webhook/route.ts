import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: "Webhook secret missing" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string | null;
      const subscriptionId = session.subscription as string | null;
      const plan = session.metadata?.plan;
      if (customerId) {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: "premium",
            subscriptionId: subscriptionId ?? undefined,
            subscriptionPlan: plan === "yearly" ? "yearly" : "monthly",
            subscriptionEndsAt: null,
          },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const isActive = ["active", "trialing"].includes(subscription.status);
      const interval = subscription.items.data[0]?.price?.recurring?.interval;
      const plan = interval === "year" ? "yearly" : "monthly";

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: isActive ? "premium" : "free",
          subscriptionId: subscription.id,
          subscriptionPlan: plan,
          subscriptionEndsAt: null,
        },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
