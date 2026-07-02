import type Stripe from "stripe";

export type CheckoutProduct = "subscription" | "urgent_answer";

export function getMonthlyPriceId(): string | undefined {
  return (
    process.env.STRIPE_PRICE_ID_MONTHLY ??
    process.env.STRIPE_PRICE_MONTHLY ??
    process.env.STRIPE_PRICE_ID
  );
}

export function getAnnualPriceId(): string | undefined {
  return process.env.STRIPE_PRICE_ID_ANNUAL ?? process.env.STRIPE_PRICE_YEARLY;
}

export function getUrgentAnswerPriceId(): string | undefined {
  return process.env.STRIPE_PRICE_ID_URGENT_ANSWER;
}

export function parseCheckoutProduct(value: string | null): CheckoutProduct {
  return value === "urgent" || value === "urgent_answer" ? "urgent_answer" : "subscription";
}

export function isUrgentCheckoutSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.product === "urgent_answer";
}

export const URGENT_ANSWER_PRICE_USD = 24;
