import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendMetaServerEvent } from "@/lib/meta-capi";
import { sendGa4ServerEvent } from "@/lib/ga4-server";
import { recordFunnelEventOnce } from "@/lib/funnel-event";
import { stripeId } from "@/lib/stripe-id";
import { isUrgentCheckoutSession } from "@/lib/stripe-prices";
import {
  fulfillSubscriptionCheckoutGuestEmail,
  fulfillUrgentAnswerCheckout,
} from "@/lib/urgent-answer";

/** First write wins — Stripe retries must not re-send GA conversion events. */
async function sendGa4ConversionOnce(input: {
  eventName: string;
  transactionId: string;
  gaClientId?: string;
  path?: string;
  planName?: string;
  price?: number;
  currency?: string;
  params: Record<string, string | number | boolean | undefined>;
}) {
  const first = await recordFunnelEventOnce({
    name: input.eventName,
    path: input.path ?? null,
    planName: input.planName ?? null,
    price: input.price ?? null,
    currency: input.currency ?? "USD",
    transactionId: input.transactionId,
    metadata: input.params,
  });
  if (!first) return false;
  return sendGa4ServerEvent(input.eventName, input.params, input.gaClientId);
}

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

        if (isUrgentCheckoutSession(session)) {
          await fulfillUrgentAnswerCheckout(session);

          const email =
            session.customer_details?.email ?? session.customer_email ?? null;
          const purchaseValue =
            typeof session.amount_total === "number"
              ? Math.round((session.amount_total / 100) * 100) / 100
              : 24;
          const sourcePath =
            session.metadata?.source === "triage"
              ? "/triage"
              : session.metadata?.source === "check"
                ? "/check"
                : "/";

          const gaClientId = session.metadata?.ga_client_id || undefined;
          const urgentGaParams = {
            transaction_id: session.id,
            value: purchaseValue,
            currency: "USD" as const,
            plan_name: "urgent_answer",
            price: purchaseValue,
            source_page: sourcePath,
          };
          await Promise.allSettled([
            sendMetaServerEvent({
              eventName: "Purchase",
              eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com"}${sourcePath}`,
              value: purchaseValue,
              contentName: "FursBliss Urgent Symptom Answer",
              email,
              eventId: `${session.id}:purchase`,
            }),
            sendGa4ConversionOnce({
              eventName: "purchase",
              transactionId: session.id,
              gaClientId,
              path: sourcePath,
              planName: "urgent_answer",
              price: purchaseValue,
              currency: "USD",
              params: urgentGaParams,
            }),
            sendGa4ConversionOnce({
              eventName: "checkout_completed",
              transactionId: session.id,
              gaClientId,
              path: sourcePath,
              planName: "urgent_answer",
              price: purchaseValue,
              currency: "USD",
              params: urgentGaParams,
            }),
          ]);
          break;
        }

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
            } else {
              await fulfillSubscriptionCheckoutGuestEmail(session, email);
            }
          }
        } else if (email) {
          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          });
          if (!existingUser) {
            await fulfillSubscriptionCheckoutGuestEmail(session, email);
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

        const gaClientId = session.metadata?.ga_client_id || undefined;
        const planName = plan === "yearly" ? "yearly" : "monthly";
        const subGaParams = {
          transaction_id: session.id,
          value: purchaseValue,
          currency: "USD" as const,
          plan_name: planName,
          price: purchaseValue,
          source_page: sourcePath,
        };
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
          sendGa4ConversionOnce({
            eventName: "purchase",
            transactionId: session.id,
            gaClientId,
            path: sourcePath,
            planName,
            price: purchaseValue,
            currency: "USD",
            params: subGaParams,
          }),
          sendGa4ConversionOnce({
            eventName: "checkout_completed",
            transactionId: session.id,
            gaClientId,
            path: sourcePath,
            planName,
            price: purchaseValue,
            currency: "USD",
            params: subGaParams,
          }),
          sendGa4ConversionOnce({
            eventName: "subscription_started",
            transactionId: session.id,
            gaClientId,
            path: sourcePath,
            planName,
            price: purchaseValue,
            currency: "USD",
            params: subGaParams,
          }),
        ]);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const gaClientId = session.metadata?.ga_client_id || undefined;
        const planName = session.metadata?.plan || "unknown";
        const purchaseValue =
          typeof session.amount_total === "number"
            ? Math.round((session.amount_total / 100) * 100) / 100
            : undefined;
        const abandonParams = {
          transaction_id: session.id,
          plan_name: planName,
          price: purchaseValue,
          currency: "USD" as const,
          value: purchaseValue,
          source_page: session.metadata?.source || "stripe",
        };
        await Promise.allSettled([
          sendGa4ConversionOnce({
            eventName: "checkout_abandoned",
            transactionId: session.id,
            gaClientId,
            path: abandonParams.source_page,
            planName,
            price: purchaseValue,
            currency: "USD",
            params: abandonParams,
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
    // Only fulfillment DB writes can reach this catch. Every analytics call above
    // (Meta/GA via sendMetaServerEvent) is wrapped in Promise.allSettled and never
    // rejects, so awaiting them cannot throw. A caught error here therefore means a
    // PAID session failed to fulfill — return 500 so Stripe retries the webhook
    // instead of silently dropping the purchase.
    console.error(`Stripe webhook handler error (${event.type})`, error);
    return NextResponse.json(
      { message: "Webhook fulfillment failed; please retry." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
