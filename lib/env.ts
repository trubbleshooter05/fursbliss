/**
 * Production env checks when running on Vercel (VERCEL=1).
 * Use SKIP_ENV_VALIDATION=1 only for exceptional local tooling.
 */
export function validateEnvAtStartup(): void {
  if (process.env.SKIP_ENV_VALIDATION === "1") return;
  if (process.env.VERCEL !== "1") return;

  const required = ["DATABASE_URL", "NEXTAUTH_SECRET"] as const;
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

export type BreadcrumbItem = { name: string; path: string };

const SITE_ORIGIN = "https://www.fursbliss.com";

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path}`,
    })),
  };
}
