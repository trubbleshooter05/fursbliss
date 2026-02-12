import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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

export const metadata: Metadata = {
  title: "FursBliss | Dog Longevity Intelligence Platform",
  description:
    "Track daily health signals, get AI-powered supplement guidance, and prepare for LOY-002. The longevity command center for your dog.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FursBliss | The Longevity Command Center for Your Dog",
    description:
      "AI-powered health tracking and longevity intelligence for senior dogs.",
    type: "website",
    url: "/",
    siteName: "FursBliss",
  },
  twitter: {
    card: "summary_large_image",
    title: "FursBliss | Dog Longevity Intelligence Platform",
    description:
      "Track daily health signals, AI supplement guidance, and LOY-002 readiness for your dog.",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
