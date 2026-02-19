import { createHmac, timingSafeEqual } from "crypto";

const MAX_TOKEN_AGE_DAYS = 45;

type UnsubscribeTokenPayload = {
  enrollmentId: string;
  userId: string;
  exp: number;
};

function getSecret() {
  return (
    process.env.EMAIL_UNSUBSCRIBE_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "fursbliss-email-unsubscribe-secret"
  );
}

function encode(payload: UnsubscribeTokenPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decode(raw: string): UnsubscribeTokenPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (
      typeof parsed?.enrollmentId !== "string" ||
      typeof parsed?.userId !== "string" ||
      typeof parsed?.exp !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");
}

export function createUnsubscribeToken(input: { enrollmentId: string; userId: string }) {
  const exp = Date.now() + MAX_TOKEN_AGE_DAYS * 24 * 60 * 60 * 1000;
  const encodedPayload = encode({
    enrollmentId: input.enrollmentId,
    userId: input.userId,
    exp,
  });
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function parseUnsubscribeToken(token: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = sign(encodedPayload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  const payload = decode(encodedPayload);
  if (!payload) return null;
  if (Date.now() > payload.exp) return null;
  return payload;
}
