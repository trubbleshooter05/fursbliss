import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MetaPixel } from "@/components/meta-pixel";
import { MetaEventDebug } from "@/components/meta-event-debug";
import { ExitIntentPopup } from "@/components/site/exit-intent-popup";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

const SHARE_IMAGE_URL = "/og-default.jpg";
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FursBliss",
  description:
    "Dog longevity intelligence platform — health tracking, AI supplement guidance, and LOY-002 readiness tools.",
  url: "https://fursbliss.com",
  sameAs: [],
};

export const metadata: Metadata = {
  title: "FursBliss — Dog Longevity Tracking & LOY-002 Readiness Platform",
  description:
    "Track your dog's health, get AI supplement guidance, and prepare for LOY-002 — the first FDA dog longevity drug. Free longevity quiz and breed risk timelines.",
  metadataBase: new URL("https://fursbliss.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FursBliss — Dog Longevity Tracking & LOY-002 Readiness Platform",
    description:
      "Track your dog's health, get AI supplement guidance, and prepare for LOY-002 — the first FDA dog longevity drug. Free longevity quiz and breed risk timelines.",
    type: "website",
    url: "/",
    siteName: "FursBliss",
    images: [
      {
        url: SHARE_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "FursBliss | Dog Longevity Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FursBliss — Dog Longevity Tracking & LOY-002 Readiness Platform",
    description:
      "Track your dog's health, get AI supplement guidance, and prepare for LOY-002 — the first FDA dog longevity drug. Free longevity quiz and breed risk timelines.",
    images: [SHARE_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${jakarta.variable} ${spaceMono.variable} bg-background font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_JSON_LD),
          }}
        />
        <MetaPixel />
        <MetaEventDebug />
        {children}
        <ExitIntentPopup />
        <Toaster />
      </body>
    </html>
  );
}
