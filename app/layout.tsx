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
  title: "FursBliss | Pet Health Tracking",
  description:
    "Track your pet's health, unlock AI supplement guidance, and monitor trends with FursBliss.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fursbliss.com"),
  openGraph: {
    title: "FursBliss | Pet Health Tracking",
    description:
      "Track your pet's health, unlock AI supplement guidance, and monitor trends with FursBliss.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "FursBliss | Pet Health Tracking",
    description:
      "Track your pet's health, unlock AI supplement guidance, and monitor trends with FursBliss.",
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
