import { createHmac, timingSafeEqual } from "crypto";

export type WalksLeftSharePayload = {
  name: string;
  breed: string;
  walks: number;
  weekends: number;
  sunsets: number;
};

function shareSecret() {
  return (
    process.env.WALKS_LEFT_SHARE_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "fursbliss-walks-left-dev-secret"
  );
}

function sanitizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function canonicalString(payload: WalksLeftSharePayload) {
  return [
    sanitizeText(payload.name, 64),
    sanitizeText(payload.breed, 80),
    clampNumber(payload.walks, 0, 1_000_000),
    clampNumber(payload.weekends, 0, 100_000),
    clampNumber(payload.sunsets, 0, 1_000_000),
  ].join("|");
}

export function normalizeWalksLeftSharePayload(payload: WalksLeftSharePayload): WalksLeftSharePayload {
  return {
    name: sanitizeText(payload.name, 64),
    breed: sanitizeText(payload.breed, 80),
    walks: clampNumber(payload.walks, 0, 1_000_000),
    weekends: clampNumber(payload.weekends, 0, 100_000),
    sunsets: clampNumber(payload.sunsets, 0, 1_000_000),
  };
}

export function signWalksLeftSharePayload(payload: WalksLeftSharePayload) {
  const normalized = normalizeWalksLeftSharePayload(payload);
  const digest = createHmac("sha256", shareSecret())
    .update(canonicalString(normalized))
    .digest("base64url");
  return digest;
}

export function verifyWalksLeftSharePayload(
  payload: WalksLeftSharePayload,
  signature: string
) {
  if (!signature) return false;
  const expected = signWalksLeftSharePayload(payload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function parseWalksLeftShareFromSearchParams(searchParams: URLSearchParams) {
  const name = searchParams.get("name");
  const breed = searchParams.get("breed");
  const walks = searchParams.get("walks");
  const weekends = searchParams.get("weekends");
  const sunsets = searchParams.get("sunsets");
  const sig = searchParams.get("sig");

  if (!name || !breed || !walks || !weekends || !sunsets || !sig) {
    return null;
  }

  const payload = normalizeWalksLeftSharePayload({
    name,
    breed,
    walks: Number(walks),
    weekends: Number(weekends),
    sunsets: Number(sunsets),
  });

  if (!verifyWalksLeftSharePayload(payload, sig)) {
    return null;
  }

  return payload;
}

export function buildWalksLeftShareUrl(baseUrl: string, payload: WalksLeftSharePayload) {
  const normalized = normalizeWalksLeftSharePayload(payload);
  const sig = signWalksLeftSharePayload(normalized);
  const params = new URLSearchParams({
    name: normalized.name,
    breed: normalized.breed,
    walks: String(normalized.walks),
    weekends: String(normalized.weekends),
    sunsets: String(normalized.sunsets),
    sig,
  });
  return `${baseUrl}/walks-left/share?${params.toString()}`;
}
