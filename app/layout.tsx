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

const SHARE_IMAGE_URL = "/opengraph-image";
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FursBliss",
  description:
    "Dog longevity intelligence platform - health tracking, supplement safety, and LOY-002 readiness",
  url: "https://www.fursbliss.com",
};

export const metadata: Metadata = {
  title: "FursBliss | Dog Longevity Intelligence Platform",
  description:
    "Track daily health signals, get AI-powered supplement guidance, and prepare for LOY-002. The longevity command center for your dog.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com"),
  openGraph: {
    title: "FursBliss | The Longevity Command Center for Your Dog",
    description:
      "AI-powered health tracking and longevity intelligence for senior dogs.",
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
    title: "FursBliss | Dog Longevity Intelligence Platform",
    description:
      "Track daily health signals, AI supplement guidance, and LOY-002 readiness for your dog.",
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
