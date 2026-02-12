import type { MetadataRoute } from "next";
import { breedPages } from "@/lib/breed-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
  const now = new Date();

  const staticRoutes = [
    "",
    "/pricing",
    "/longevity-drugs",
    "/quiz",
    "/blog",
    "/breeds",
    "/trends",
    "/community",
    "/privacy",
    "/terms",
    "/invite",
    "/signup",
    "/login",
  ];
  const blogRoutes = [
    "/blog/loyal-series-c-100m-loy-002-update",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...breedPages.map((page) => ({
      url: `${base}/breeds/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...blogRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
}
