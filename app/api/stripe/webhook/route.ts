import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendMetaServerEvent } from "@/lib/meta-capi";
import { stripeId } from "@/lib/stripe-id";

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
    console.error("Stripe webhook signature error", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = stripeId(session.customer);
        const subscriptionId = stripeId(session.subscription);
        const plan = session.metadata?.plan;
        const email =
          session.customer_details?.email ?? session.customer_email ?? null;

        if (customerId) {
          const updateResult = await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              subscriptionStatus: "premium",
              ...(subscriptionId ? { subscriptionId } : {}),
              subscriptionPlan: plan === "yearly" ? "yearly" : "monthly",
              subscriptionEndsAt: null,
            },
          });

          if (updateResult.count === 0 && email) {
            const existingUser = await prisma.user.findUnique({
              where: { email },
              select: { id: true },
            });
            if (existingUser) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  stripeCustomerId: customerId,
                  subscriptionStatus: "premium",
                  ...(subscriptionId ? { subscriptionId } : {}),
                  subscriptionPlan: plan === "yearly" ? "yearly" : "monthly",
                  subscriptionEndsAt: null,
                },
              });
            }
          }
        }

        const purchaseValue =
          typeof session.amount_total === "number"
            ? Math.round((session.amount_total / 100) * 100) / 100
            : plan === "yearly"
              ? 59
              : 9;
        const sourcePath =
          session.metadata?.source === "triage"
            ? "/triage"
            : session.metadata?.source === "quiz-results"
              ? "/quiz"
              : "/pricing";
        const eventSourceUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com"}${sourcePath}`;

        await Promise.allSettled([
          sendMetaServerEvent({
            eventName: "Purchase",
            eventSourceUrl,
            value: purchaseValue,
            contentName: "FursBliss Premium",
            email,
            eventId: `${session.id}:purchase`,
          }),
          sendMetaServerEvent({
            eventName: "CompletedPurchase",
            eventSourceUrl,
            value: purchaseValue,
            contentName: "FursBliss Premium",
            email,
            eventId: `${session.id}:completed`,
          }),
        ]);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = stripeId(subscription.customer);
        if (!customerId) break;

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
  } catch (error) {
    console.error(`Stripe webhook handler error (${event.type})`, error);
  }

  return NextResponse.json({ received: true });
}
