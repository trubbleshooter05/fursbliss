"use client";

import { buildCheckoutAttributionParams, getStoredAttribution } from "@/lib/attribution";
import { cleanGaParams, shouldCollectAnalytics, type GaFunnelParams } from "@/lib/ga-tracking";
import { URGENT_ANSWER_PRICE_USD } from "@/lib/stripe-prices";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const URGENT_FUNNEL_SESSION_KEY = "fursbliss_urgent_funnel_session";

type MetaEventParams = Record<string, unknown>;
export type MetaEventStatus = "sent" | "dropped";

export type MetaEventDebugDetail = {
  eventName: string;
  params?: MetaEventParams;
  eventId?: string;
  status: MetaEventStatus;
  attempts: number;
};

type TrackMetaEventOptions = {
  retries?: number;
  delayMs?: number;
  eventId?: string;
};

const defaultTrackOptions = {
  retries: 12,
  delayMs: 150,
} as const;

const META_DEBUG_EVENT_NAME = "fursbliss:meta-event";

function emitMetaDebugEvent(detail: MetaEventDebugDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(META_DEBUG_EVENT_NAME, { detail }));
}

function dispatchMetaEvent(
  eventType: "track" | "trackCustom",
  eventName: string,
  params?: MetaEventParams,
  eventId?: string
): boolean {
  const fbq = (window as Window & { fbq?: (...args: any[]) => void }).fbq;
  if (!fbq) {
    return false;
  }

  const eventOptions = eventId ? { eventID: eventId } : undefined;

  if (params) {
    if (eventOptions) {
      fbq(eventType, eventName, params, eventOptions);
    } else {
      fbq(eventType, eventName, params);
    }
  } else {
    if (eventOptions) {
      fbq(eventType, eventName, undefined, eventOptions);
    } else {
      fbq(eventType, eventName);
    }
  }

  return true;
}

/**
 * Track Meta events with a short retry window so fast actions
 * (like immediate signup redirects) do not drop events.
 */
export function trackMetaEvent(
  eventName: string,
  params?: MetaEventParams,
  options: TrackMetaEventOptions = {}
): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  const { retries, delayMs, eventId } = { ...defaultTrackOptions, ...options };

  return new Promise((resolve) => {
    const attemptTrack = (attempt: number) => {
      const didDispatch = dispatchMetaEvent("track", eventName, params, eventId);
      if (didDispatch) {
        emitMetaDebugEvent({
          eventName,
          params,
          eventId,
          status: "sent",
          attempts: attempt + 1,
        });
        resolve(true);
        return;
      }

      if (attempt >= retries) {
        emitMetaDebugEvent({
          eventName,
          params,
          eventId,
          status: "dropped",
          attempts: attempt + 1,
        });
        resolve(false);
        return;
      }

      window.setTimeout(() => attemptTrack(attempt + 1), delayMs);
    };

    attemptTrack(0);
  });
}

export function trackMetaCustomEvent(
  eventName: string,
  params?: MetaEventParams,
  options: TrackMetaEventOptions = {}
): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  const { retries, delayMs, eventId } = { ...defaultTrackOptions, ...options };

  return new Promise((resolve) => {
    const attemptTrack = (attempt: number) => {
      const didDispatch = dispatchMetaEvent("trackCustom", eventName, params, eventId);
      if (didDispatch) {
        emitMetaDebugEvent({
          eventName,
          params,
          eventId,
          status: "sent",
          attempts: attempt + 1,
        });
        resolve(true);
        return;
      }

      if (attempt >= retries) {
        emitMetaDebugEvent({
          eventName,
          params,
          eventId,
          status: "dropped",
          attempts: attempt + 1,
        });
        resolve(false);
        return;
      }

      window.setTimeout(() => attemptTrack(attempt + 1), delayMs);
    };

    attemptTrack(0);
  });
}

export const META_DEBUG_CHANNEL = META_DEBUG_EVENT_NAME;

type CheckoutTrackingInput = {
  source: string;
  value?: number;
  contentName?: string;
  eventIdBase?: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function sendServerCheckoutStart(input: CheckoutTrackingInput, href: string) {
  const payload = JSON.stringify({
    source: input.source,
    value: input.value ?? 9,
    contentName: input.contentName ?? "FursBliss Premium Monthly",
    href,
    eventIdBase: input.eventIdBase,
  });
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/meta/checkout-start", blob);
    return;
  }
  try {
    await fetch("/api/meta/checkout-start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // no-op
  }
}

export async function trackCheckoutStarted({
  source,
  value = 9,
  contentName = "FursBliss Premium Monthly",
  eventIdBase,
}: CheckoutTrackingInput) {
  const planName =
    contentName.toLowerCase().includes("yearly") || value >= 50
      ? "yearly"
      : contentName.toLowerCase().includes("urgent")
        ? "urgent_answer"
        : "monthly";
  const payload = {
    currency: "USD",
    value,
    content_name: contentName,
    source,
  };
  const base = eventIdBase ?? `checkout-${Date.now()}`;
  trackGa4Event(
    "checkout_started",
    {
      source_page: currentSourcePage(),
      plan_name: planName,
      price: value,
      currency: "USD",
      user_status: currentUserStatus(),
      destination_url: typeof window !== "undefined" ? window.location.href : "",
      value,
      transaction_id: base,
      source,
    },
    { beacon: true, funnel: true }
  );
  sendGa4ServerBeacon("checkout_started", {
    source_page: currentSourcePage(),
    plan_name: planName,
    price: value,
    currency: "USD",
    value,
    source,
  });
  const fbq = (typeof window !== "undefined"
    ? (window as Window & { fbq?: (...args: unknown[]) => void }).fbq
    : undefined);
  if (fbq) {
    // Explicit direct fire before redirect for checkout intent.
    fbq("track", "InitiateCheckout", payload, { eventID: `${base}:initiate` });
    fbq("trackCustom", "StartedCheckout", payload, { eventID: `${base}:started` });
  }
  await Promise.allSettled([
    trackMetaEvent("InitiateCheckout", payload, { eventId: `${base}:initiate` }),
    trackMetaCustomEvent("StartedCheckout", payload, { eventId: `${base}:started` }),
  ]);
}


function readGaClientIdFromCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;)\s*_ga=([^;]+)/);
  if (!match) return "";
  const parts = decodeURIComponent(match[1]).split(".");
  if (parts.length >= 4) return `${parts[2]}.${parts[3]}`;
  return "";
}

function sendGa4ServerBeacon(eventName: string, params: Record<string, unknown>) {
  if (typeof navigator === "undefined") return;
  const payload = JSON.stringify({
    event: eventName,
    client_id: readGaClientIdFromCookie(),
    params,
  });
  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon("/api/analytics/ga4", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics/ga4", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

function waitForGtag(maxMs = 2000): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof window.gtag === "function") return Promise.resolve(true);

  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (typeof window.gtag === "function") {
        resolve(true);
        return;
      }
      if (Date.now() - started >= maxMs) {
        resolve(false);
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

function recordFunnelBeacon(eventName: string, params?: Record<string, unknown>) {
  if (typeof navigator === "undefined") return;
  const payload = JSON.stringify({
    name: eventName,
    params: params ?? {},
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
  try {
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/analytics/funnel", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // no-op
  }
}

function trackGa4Event(
  eventName: string,
  params?: Record<string, unknown>,
  options?: { beacon?: boolean; funnel?: boolean }
) {
  if (typeof window === "undefined") return;
  if (!shouldCollectAnalytics()) return;
  const cleaned = cleanGaParams(params as GaFunnelParams | undefined);
  const payload = options?.beacon ? { ...cleaned, transport_type: "beacon" } : cleaned;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  } else {
    // gtag.js not loaded yet — queue so the tag picks it up once ready
    window.dataLayer.push(["event", eventName, payload]);
  }
  if (options?.funnel !== false) {
    recordFunnelBeacon(eventName, cleaned);
  }
}

function currentSourcePage(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname + window.location.search;
}

function currentUserStatus(): string {
  if (typeof document === "undefined") return "anonymous";
  // Soft signal only — cookie presence of next-auth session token
  if (document.cookie.includes("authjs.session-token") || document.cookie.includes("__Secure-authjs.session-token")) {
    return "authenticated";
  }
  return "anonymous";
}

export function trackPricingViewed(extra?: GaFunnelParams) {
  trackGa4Event(
    "pricing_viewed",
    {
      source_page: currentSourcePage(),
      user_status: currentUserStatus(),
      currency: "USD",
      ...extra,
    },
    { funnel: true }
  );
}

export function trackSignupStarted(extra?: GaFunnelParams) {
  trackGa4Event(
    "signup_started",
    {
      source_page: currentSourcePage(),
      user_status: currentUserStatus(),
      ...extra,
    },
    { funnel: true }
  );
}

export function trackSignupCompleted(extra?: GaFunnelParams) {
  trackGa4Event(
    "signup_completed",
    {
      source_page: currentSourcePage(),
      user_status: "authenticated",
      ...extra,
    },
    { funnel: true }
  );
}

export function trackCtaClicked(extra: GaFunnelParams & { button_text: string; destination_url: string }) {
  trackGa4Event(
    "cta_clicked",
    {
      source_page: currentSourcePage(),
      user_status: currentUserStatus(),
      ...extra,
    },
    { funnel: true }
  );
}

export function trackCheckoutAbandoned(extra?: GaFunnelParams) {
  trackGa4Event(
    "checkout_abandoned",
    {
      source_page: currentSourcePage(),
      user_status: currentUserStatus(),
      currency: "USD",
      ...extra,
    },
    { funnel: true }
  );
}

function getUrgentAttributionContext(source: string) {
  const attribution = getStoredAttribution();
  const params = new URLSearchParams(window.location.search);
  return {
    source,
    utm_source: attribution.utm_source || params.get("utm_source") || "",
    utm_medium: attribution.utm_medium || params.get("utm_medium") || "",
    utm_campaign: attribution.utm_campaign || params.get("utm_campaign") || "",
  };
}

export function markUrgentFunnelSession(sessionId: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(URGENT_FUNNEL_SESSION_KEY, sessionId);
}

export function getUrgentFunnelSessionId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(URGENT_FUNNEL_SESSION_KEY);
}

export async function trackUrgentCheckoutStart({ source }: { source: string }) {
  if (typeof window === "undefined") return;
  await waitForGtag();
  const ctx = getUrgentAttributionContext(source);
  trackGa4Event("urgent_checkout_start", ctx, { beacon: true });
  sendGa4ServerBeacon("urgent_checkout_start", ctx);
  void trackMetaCustomEvent("UrgentCheckoutStart", ctx);
}

export function trackUrgentAnswerDelivered({
  session_id,
  used_entitlement,
}: {
  session_id: string;
  used_entitlement: boolean;
}) {
  if (typeof window === "undefined") return;
  const ctx = { ...getUrgentAttributionContext("triage"), session_id, used_entitlement };
  trackGa4Event("urgent_answer_delivered", ctx);
  void trackMetaCustomEvent("UrgentAnswerDelivered", ctx);
}

export function trackUrgentToPremiumViewed({ source }: { source: string }) {
  if (typeof window === "undefined") return;
  const ctx = getUrgentAttributionContext(source);
  trackGa4Event("urgent_to_premium_viewed", ctx);
  void trackMetaCustomEvent("UrgentToPremiumViewed", ctx);
}

export function trackUrgentToPremiumConverted({
  session_id,
  plan,
}: {
  session_id: string;
  plan: string;
}) {
  if (typeof window === "undefined") return;
  const ctx = { ...getUrgentAttributionContext("urgent_funnel"), session_id, plan };
  trackGa4Event("urgent_to_premium_converted", ctx);
  void trackMetaCustomEvent("UrgentToPremiumConverted", ctx);
  sessionStorage.removeItem(URGENT_FUNNEL_SESSION_KEY);
}

export function trackUrgentGuestClaimed({ session_id }: { session_id?: string }) {
  if (typeof window === "undefined") return;
  const ctx = { ...getUrgentAttributionContext("signup"), session_id: session_id ?? "" };
  trackGa4Event("urgent_guest_claimed", ctx);
  void trackMetaCustomEvent("UrgentGuestClaimed", ctx);
}

export async function trackUrgentCheckoutCompleted({
  source,
  session_id,
  eventIdBase,
}: {
  source: string;
  session_id?: string;
  eventIdBase?: string;
}) {
  const value = URGENT_ANSWER_PRICE_USD;
  const contentName = "FursBliss Urgent Symptom Answer";
  const base = eventIdBase ?? session_id ?? `urgent-${Date.now()}`;
  if (session_id) {
    markUrgentFunnelSession(session_id);
  }

  const payload = {
    currency: "USD",
    value,
    content_name: contentName,
    source,
  };

  const fbq = (typeof window !== "undefined"
    ? (window as Window & { fbq?: (...args: unknown[]) => void }).fbq
    : undefined);
  if (fbq) {
    fbq("track", "Purchase", payload, { eventID: `${base}:urgent-purchase` });
    fbq("trackCustom", "UrgentCheckoutCompleted", payload, { eventID: `${base}:urgent-completed` });
  }

  // GA4 purchase / checkout_completed fire only from the Stripe webhook after
  // verified payment — do not gtag or Measurement-Protocol from the success page.
  trackGa4Event(
    "urgent_checkout_completed",
    {
      ...getUrgentAttributionContext(source),
      session_id: session_id ?? base,
    },
    { beacon: true, funnel: false }
  );

  await Promise.allSettled([
    trackMetaEvent("Purchase", payload, { eventId: `${base}:urgent-purchase` }),
    trackMetaCustomEvent("UrgentCheckoutCompleted", payload, { eventId: `${base}:urgent-completed` }),
  ]);
}

export async function trackUrgentCheckoutAndRedirect(href: string, input: { source: string }) {
  const eventIdBase =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `urgent-checkout-${Date.now()}`;
  const mergedInput = {
    source: input.source,
    value: URGENT_ANSWER_PRICE_USD,
    contentName: "FursBliss Urgent Symptom Answer",
    eventIdBase,
  };

  await trackUrgentCheckoutStart({ source: input.source });
  await wait(150);

  const attributionParams = buildCheckoutAttributionParams();
  const hrefWithAttribution = attributionParams ? `${href}${attributionParams}` : href;
  const isMobile =
    typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    const serverPromise = sendServerCheckoutStart(mergedInput, hrefWithAttribution);
    const clientPromise = trackCheckoutStarted(mergedInput);
    await Promise.allSettled([serverPromise, clientPromise]);
    await wait(800);
  } else {
    void trackCheckoutStarted(mergedInput);
    void sendServerCheckoutStart(mergedInput, hrefWithAttribution);
    await wait(300);
  }

  window.location.assign(hrefWithAttribution);
}

export async function trackPurchaseCompleted({
  source,
  value = 9,
  contentName = "FursBliss Premium Monthly",
  eventIdBase,
}: CheckoutTrackingInput) {
  const payload = {
    currency: "USD",
    value,
    content_name: contentName,
    source,
  };
  const base = eventIdBase ?? `purchase-${Date.now()}`;

  const urgentSessionId = getUrgentFunnelSessionId();
  const plan =
    contentName.toLowerCase().includes("yearly") || value >= 50 ? "yearly" : "monthly";
  if (urgentSessionId) {
    trackUrgentToPremiumConverted({ session_id: urgentSessionId, plan });
  }

  // Meta Pixel (preserved exactly as before)
  const fbq = (typeof window !== "undefined"
    ? (window as Window & { fbq?: (...args: unknown[]) => void }).fbq
    : undefined);
  if (fbq) {
    fbq("track", "Purchase", payload, { eventID: `${base}:purchase` });
    fbq("trackCustom", "CompletedPurchase", payload, { eventID: `${base}:completed` });
  }

  // GA4 purchase / checkout_completed / subscription_started are server-only
  // (Stripe webhook + FunnelEvent idempotency). Client success page = Meta only.

  await Promise.allSettled([
    trackMetaEvent("Purchase", payload, { eventId: `${base}:purchase` }),
    trackMetaCustomEvent("CompletedPurchase", payload, { eventId: `${base}:completed` }),
  ]);
}

export async function trackCheckoutAndRedirect(href: string, input: CheckoutTrackingInput) {
  const eventIdBase =
    input.eventIdBase ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `checkout-${Date.now()}`);
  const mergedInput = { ...input, eventIdBase };

  // Append first-touch attribution params so the checkout API can persist them to Stripe
  const attributionParams = buildCheckoutAttributionParams();
  const hrefWithAttribution = attributionParams ? `${href}${attributionParams}` : href;

  trackCtaClicked({
    button_text: input.contentName ?? "Start checkout",
    destination_url: hrefWithAttribution,
    plan_name:
      (input.contentName ?? "").toLowerCase().includes("yearly") || (input.value ?? 9) >= 50
        ? "yearly"
        : "monthly",
    price: input.value ?? 9,
    currency: "USD",
  });

  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    const serverPromise = sendServerCheckoutStart(mergedInput, hrefWithAttribution);
    const clientPromise = trackCheckoutStarted(mergedInput);
    await Promise.allSettled([serverPromise, clientPromise]);
    await wait(800);
  } else {
    void trackCheckoutStarted(mergedInput);
    void sendServerCheckoutStart(mergedInput, hrefWithAttribution);
    await wait(300);
  }

  window.location.assign(hrefWithAttribution);
}
