import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type FunnelEventWrite = {
  name: string;
  path?: string | null;
  planName?: string | null;
  price?: number | null;
  currency?: string | null;
  userStatus?: string | null;
  buttonText?: string | null;
  destinationUrl?: string | null;
  transactionId?: string | null;
  metadata?: Record<string, unknown> | null;
};

function normalizeTransactionId(id?: string | null): string | null {
  if (typeof id !== "string") return null;
  const trimmed = id.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

/**
 * Persist a funnel row once. Returns true if this call inserted a new row.
 * When transactionId is set, retries with the same (name, transactionId) return false.
 */
export async function recordFunnelEventOnce(input: FunnelEventWrite): Promise<boolean> {
  const transactionId = normalizeTransactionId(input.transactionId);

  try {
    await prisma.funnelEvent.create({
      data: {
        name: input.name,
        path: input.path ?? null,
        planName: input.planName ?? null,
        price: input.price ?? null,
        currency: input.currency ?? null,
        userStatus: input.userStatus ?? null,
        buttonText: input.buttonText ?? null,
        destinationUrl: input.destinationUrl ?? null,
        transactionId,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}
