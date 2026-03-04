"use client";

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
  const payload = {
    currency: "USD",
    value,
    content_name: contentName,
    source,
  };
  const base = eventIdBase ?? `checkout-${Date.now()}`;
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
  const fbq = (typeof window !== "undefined"
    ? (window as Window & { fbq?: (...args: unknown[]) => void }).fbq
    : undefined);
  if (fbq) {
    // Explicit direct fire on Stripe success landing.
    fbq("track", "Purchase", payload, { eventID: `${base}:purchase` });
    fbq("trackCustom", "CompletedPurchase", payload, { eventID: `${base}:completed` });
  }
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
  
  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // CRITICAL: For mobile, fire everything synchronously and wait for ALL promises
  if (isMobile) {
    // Fire both client and server tracking in parallel
    const serverPromise = sendServerCheckoutStart(mergedInput, href);
    const clientPromise = trackCheckoutStarted(mergedInput);
    // Wait for BOTH to complete (not void)
    await Promise.allSettled([serverPromise, clientPromise]);
    // Extra safety buffer for mobile
    await wait(800);
  } else {
    // Desktop: fire and minimal wait
    void trackCheckoutStarted(mergedInput);
    void sendServerCheckoutStart(mergedInput, href);
    await wait(300);
  }
  
  window.location.assign(href);
}
