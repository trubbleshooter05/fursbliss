import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/pets",
          "/account",
          "/api",
          "/admin",
          "/triage",
          "/interaction-checker",
          "/insights",
          "/logs",
          "/referrals",
        ],
      },
    ],
    sitemap: "https://www.fursbliss.com/sitemap.xml",
  };
}
