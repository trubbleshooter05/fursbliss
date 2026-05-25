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
          "/interaction-checker",
          "/insights",
          "/logs",
          "/referrals",
          "/login",
          "/signup",
          "/verify-email",
          "/reset-password",
          "/forgot-password",
          "/invite",
          // Block transactional/session query-param variants to prevent index pollution
          "/*?session_id=",
          "/*?checkout=",
          "/*?upgraded=",
          "/*?resultId=",
        ],
      },
    ],
    sitemap: "https://www.fursbliss.com/sitemap.xml",
  };
}
