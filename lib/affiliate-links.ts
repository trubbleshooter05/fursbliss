const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG?.trim();

export function amazonSearchUrl(query: string): string {
  const q = encodeURIComponent(query);
  if (AMAZON_TAG) {
    return `https://www.amazon.com/s?k=${q}&tag=${encodeURIComponent(AMAZON_TAG)}`;
  }
  return `https://www.amazon.com/s?k=${q}`;
}

export const PARTNER_LINKS = {
  trupanion: "https://www.trupanion.com/partners",
  pawp: "https://pawp.com",
} as const;

export const SENIOR_DOG_PRODUCTS = [
  {
    label: "Senior dog joint supplements",
    query: "senior dog joint supplement glucosamine",
  },
  {
    label: "Orthopedic dog beds",
    query: "orthopedic dog bed large senior",
  },
  {
    label: "Senior dog multivitamins",
    query: "senior dog multivitamin chew",
  },
] as const;
