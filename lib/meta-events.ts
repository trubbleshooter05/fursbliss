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
