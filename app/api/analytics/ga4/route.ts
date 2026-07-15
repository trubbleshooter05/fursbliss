import { NextResponse } from "next/server";
import { sendGa4ServerEvent } from "@/lib/ga4-server";

type Body = {
  event?: string;
  client_id?: string;
  params?: Record<string, string | number | boolean>;
};

/** Paid-conversion events are webhook-only — ignore client beacons. */
const SERVER_OWNED = new Set([
  "purchase",
  "checkout_completed",
  "subscription_started",
]);

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const eventName = typeof body.event === "string" ? body.event.trim() : "";
  if (!eventName) {
    return NextResponse.json({ ok: false, message: "Missing event" }, { status: 400 });
  }

  if (SERVER_OWNED.has(eventName)) {
    return NextResponse.json({ ok: true, skipped: "server_owned" });
  }

  const sent = await sendGa4ServerEvent(eventName, body.params ?? {}, body.client_id);
  return NextResponse.json({
    ok: sent,
    queued: !sent && !process.env.GA4_MEASUREMENT_PROTOCOL_SECRET,
  });
}
