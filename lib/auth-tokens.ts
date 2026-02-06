import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MINUTES = 60;

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createVerificationToken(email: string) {
  const token = createToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.verificationToken.create({
    data: { email, token, expiresAt },
  });

  return token;
}

export async function createPasswordResetToken(email: string) {
  const token = createToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  return token;
}

export function generateReferralCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}
