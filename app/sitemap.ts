import type { MetadataRoute } from "next";
import { breedPages } from "@/lib/breed-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com";
  const now = new Date();

  const staticRoutes = [
    "",
    "/pricing",
    "/longevity-drugs",
    "/breeds",
    "/trends",
    "/community",
    "/signup",
    "/login",
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
  ];
}
