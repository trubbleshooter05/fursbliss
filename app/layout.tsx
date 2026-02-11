import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
