import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getActiveUrgentEntitlementForUser,
  getUrgentEntitlementBySessionId,
} from "@/lib/urgent-answer";
import { isUrgentCheckoutSession } from "@/lib/stripe-prices";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { searchParams } = new URL(request.url);
  const checkoutSessionId = searchParams.get("session_id");

  if (checkoutSessionId) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);
      if (!isUrgentCheckoutSession(checkoutSession)) {
        return NextResponse.json({ message: "Not an urgent answer checkout" }, { status: 400 });
      }
      if (checkoutSession.payment_status !== "paid") {
        return NextResponse.json({ message: "Payment not completed" }, { status: 400 });
      }

      const entitlement = await getUrgentEntitlementBySessionId(checkoutSessionId);
      if (!entitlement) {
        return NextResponse.json({ message: "Entitlement not found yet" }, { status: 404 });
      }

      if (userId && entitlement.userId && entitlement.userId !== userId) {
        return NextResponse.json({ message: "Entitlement belongs to another account" }, { status: 403 });
      }

      return NextResponse.json({
        entitlementId: entitlement.id,
        status: entitlement.status,
        consumedAt: entitlement.consumedAt,
        email: entitlement.email,
      });
    } catch {
      return NextResponse.json({ message: "Invalid session" }, { status: 400 });
    }
  }

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const entitlement = await getActiveUrgentEntitlementForUser(userId);
  if (!entitlement) {
    return NextResponse.json({ entitlementId: null, status: "none" });
  }

  return NextResponse.json({
    entitlementId: entitlement.id,
    status: entitlement.status,
    consumedAt: entitlement.consumedAt,
    email: entitlement.email,
  });
}
