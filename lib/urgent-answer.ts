import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripeId } from "@/lib/stripe-id";
import { isUrgentCheckoutSession } from "@/lib/stripe-prices";
import { sendCheckoutClaimEmail } from "@/lib/email";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function buildGuestCheckoutSignupUrl(sessionId: string, product: "subscription" | "urgent_answer", redirect: string) {
  const params = new URLSearchParams({
    checkout: "success",
    session_id: sessionId,
    product,
    redirect,
  });
  return `${appUrl()}/signup?${params.toString()}`;
}

export async function fulfillUrgentAnswerCheckout(session: Stripe.Checkout.Session) {
  if (!isUrgentCheckoutSession(session)) return null;
  if (session.payment_status !== "paid" && session.status !== "complete") return null;

  const email = normalizeEmail(
    session.customer_details?.email ?? session.customer_email ?? ""
  );
  if (!email) return null;

  const customerId = stripeId(session.customer);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const entitlement = await prisma.urgentAnswerEntitlement.upsert({
    where: { checkoutSessionId: session.id },
    create: {
      checkoutSessionId: session.id,
      email,
      userId: existingUser?.id ?? null,
      stripeCustomerId: customerId,
      source: session.metadata?.source ?? null,
      status: "active",
    },
    update: {
      email,
      userId: existingUser?.id ?? undefined,
      stripeCustomerId: customerId ?? undefined,
      source: session.metadata?.source ?? undefined,
    },
  });

  if (!existingUser) {
    const redirect = encodeURIComponent("/triage?urgent=ready");
    const signupUrl = buildGuestCheckoutSignupUrl(session.id, "urgent_answer", "/triage?urgent=ready");
    void sendCheckoutClaimEmail({
      email,
      signupUrl,
      productLabel: "Urgent Symptom Answer",
    });
  }

  return entitlement;
}

export async function linkUrgentEntitlementToUser(checkoutSessionId: string, userId: string, email: string) {
  const normalized = normalizeEmail(email);
  const entitlement = await prisma.urgentAnswerEntitlement.findUnique({
    where: { checkoutSessionId },
  });
  if (!entitlement) return null;
  if (normalizeEmail(entitlement.email) !== normalized) return null;

  return prisma.urgentAnswerEntitlement.update({
    where: { id: entitlement.id },
    data: { userId, email: normalized },
  });
}

export async function getActiveUrgentEntitlementForUser(userId: string) {
  return prisma.urgentAnswerEntitlement.findFirst({
    where: { userId, status: "active", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUrgentEntitlementBySessionId(sessionId: string) {
  return prisma.urgentAnswerEntitlement.findUnique({
    where: { checkoutSessionId: sessionId },
  });
}

export async function validateUrgentEntitlementForUse(
  entitlementId: string,
  userId: string | null
) {
  const entitlement = await prisma.urgentAnswerEntitlement.findUnique({
    where: { id: entitlementId },
  });
  if (!entitlement || entitlement.status !== "active" || entitlement.consumedAt) return null;
  if (userId && entitlement.userId && entitlement.userId !== userId) return null;
  if (!userId && entitlement.userId) return null;
  return entitlement;
}

export async function consumeUrgentEntitlement(entitlementId: string) {
  return prisma.urgentAnswerEntitlement.update({
    where: { id: entitlementId },
    data: { status: "consumed", consumedAt: new Date() },
  });
}

export async function fulfillSubscriptionCheckoutGuestEmail(
  session: Stripe.Checkout.Session,
  email: string
) {
  const existingUser = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (existingUser) return;
  const signupUrl = buildGuestCheckoutSignupUrl(
    session.id,
    "subscription",
    "/account?success=true"
  );
  void sendCheckoutClaimEmail({
    email: normalizeEmail(email),
    signupUrl,
    productLabel: "FursBliss Premium",
  });
}
