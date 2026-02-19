import type { Metadata } from "next";
import { PricingPageClient } from "@/components/site/pricing-page-client";

const SHARE_IMAGE_URL = "/opengraph-image";

export const metadata: Metadata = {
  title: "FursBliss Pricing | Free and Premium Dog Longevity Plans",
  description:
    "Compare Free vs Premium for LOY-002 launch readiness. Free users get notified. Premium users get prepared with vet-ready history and verification.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "FursBliss Pricing | Free and Premium Dog Longevity Plans",
    description:
      "Compare Free vs Premium for LOY-002 launch readiness. Free users get notified. Premium users get prepared with vet-ready history and verification.",
    url: "/pricing",
    type: "website",
    images: [SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    images: [SHARE_IMAGE_URL],
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
