import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { isUrgentCheckoutSession } from "@/lib/stripe-prices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ message: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      email: session.customer_details?.email ?? null,
      product: isUrgentCheckoutSession(session) ? "urgent_answer" : "subscription",
      mode: session.mode,
    });
  } catch {
    return NextResponse.json({ message: "Unable to fetch checkout session" }, { status: 400 });
  }
}
