import type { Metadata } from "next";
import { PricingPageClient } from "@/components/site/pricing-page-client";

export const metadata: Metadata = {
  title: "FursBliss Pricing — Free & Premium Dog Longevity Plans",
  description:
    "Track your dog's health free or get premium AI insights, vet-ready reports, and LOY-002 eligibility tracking for $9/month.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "FursBliss Pricing — Free & Premium Dog Longevity Plans",
    description:
      "Track your dog's health free or get premium AI insights, vet-ready reports, and LOY-002 eligibility tracking for $9/month.",
    url: "/pricing",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FursBliss Pricing — Free & Premium Dog Longevity Plans",
    description:
      "Track your dog's health free or get premium AI insights, vet-ready reports, and LOY-002 eligibility tracking for $9/month.",
    images: ["/og-default.jpg"],
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
