import type { MetadataRoute } from "next";
import { breedPages } from "@/lib/breed-pages";
import { getBlogPostsSortedByDateDesc } from "@/lib/content/blog-posts";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.fursbliss.com";
  const now = new Date();
  const blogPosts = getBlogPostsSortedByDateDesc();
  let dbBreedSlugs: string[] = [];
  try {
    const rows = await prisma.breedProfile.findMany({
      select: { seoSlug: true },
      orderBy: { seoSlug: "asc" },
    });
    dbBreedSlugs = rows.map((row) => row.seoSlug);
  } catch {
    dbBreedSlugs = [];
  }
  const uniqueBreedSlugs = Array.from(
    new Set([...breedPages.map((breed) => breed.slug), ...dbBreedSlugs])
  );
  const breedEntries = uniqueBreedSlugs.map((slug) => ({
    url: `${base}/breeds/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const primaryRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/quiz`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/breeds`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/trends`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/longevity-drugs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/loy-002`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/loy-002-waitlist`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/community`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/walks-left`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...primaryRoutes, ...blogEntries, ...breedEntries];
}
