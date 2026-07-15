import { NextResponse } from "next/server";
import { recordFunnelEventOnce } from "@/lib/funnel-event";

type Body = {
  name?: string;
  path?: string;
  params?: Record<string, unknown>;
};

const ALLOWED = new Set([
  "page_view",
  "pricing_viewed",
  "signup_started",
  "signup_completed",
  "checkout_started",
  "checkout_completed",
  "checkout_abandoned",
  "subscription_started",
  "purchase",
  "cta_clicked",
]);

/** Client must not write GA conversion rows — webhook is the source of truth. */
const CLIENT_BLOCKED = new Set([
  "purchase",
  "checkout_completed",
  "subscription_started",
]);

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || !ALLOWED.has(name)) {
    return NextResponse.json({ ok: false, message: "Invalid event" }, { status: 400 });
  }
  if (CLIENT_BLOCKED.has(name)) {
    return NextResponse.json({ ok: true, skipped: "server_owned" });
  }

  const params = body.params ?? {};
  const transactionId =
    typeof params.transaction_id === "string" ? params.transaction_id : null;

  try {
    const inserted = await recordFunnelEventOnce({
      name,
      path:
        typeof body.path === "string"
          ? body.path
          : typeof params.source_page === "string"
            ? params.source_page
            : null,
      planName: typeof params.plan_name === "string" ? params.plan_name : null,
      price:
        typeof params.price === "number"
          ? params.price
          : typeof params.value === "number"
            ? params.value
            : null,
      currency: typeof params.currency === "string" ? params.currency : null,
      userStatus: typeof params.user_status === "string" ? params.user_status : null,
      buttonText: typeof params.button_text === "string" ? params.button_text : null,
      destinationUrl:
        typeof params.destination_url === "string" ? params.destination_url : null,
      transactionId,
      metadata: params,
    });
    return NextResponse.json({ ok: true, duplicate: !inserted });
  } catch (error) {
    console.error("FunnelEvent write failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
