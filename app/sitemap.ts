import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fursbliss.com";
  const now = new Date();

  const routes = [
    "/",
    "/quiz",
    "/pricing",
    "/signup",
    "/login",
    "/blog",
    "/blog/loy-002-vs-rapamycin-triad-2026-update",
    "/blog/how-to-spot-fake-dog-health-advice-social-media",
    "/breeds",
    "/longevity-drugs",
    "/trends",
    "/community",
  ];

  return routes.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
}
