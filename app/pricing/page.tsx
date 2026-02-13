import type { Metadata } from "next";
import { PricingPageClient } from "@/components/site/pricing-page-client";

export const metadata: Metadata = {
  title: "FursBliss Pricing | Free and Premium Dog Longevity Plans",
  description:
    "Compare FursBliss Free and Premium plans for dog longevity tracking, AI insights, interaction checks, and vet-ready reports.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "FursBliss Pricing | Free and Premium Dog Longevity Plans",
    description:
      "Compare FursBliss Free and Premium plans for dog longevity tracking, AI insights, interaction checks, and vet-ready reports.",
    url: "/pricing",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
