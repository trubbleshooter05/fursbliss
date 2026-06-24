/** Normalize Stripe expandable ID fields (string or object with id). */
export function stripeId(
  value: string | { id: string } | null | undefined
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && typeof value.id === "string") return value.id;
  return null;
}
