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

export const revalidate = 3600;

type PricingPageProps = {
  searchParams?: {
    plan?: string;
    from?: string;
    resultId?: string;
  };
};

export default function PricingPage({ searchParams }: PricingPageProps) {
  const userCount = Number(process.env.NEXT_PUBLIC_SOCIAL_PROOF_DOG_COUNT ?? "1300");
  const initialPlan =
    searchParams?.plan === "yearly" || searchParams?.plan === "premium" ? "yearly" : "monthly";
  return (
    <PricingPageClient
      initialPlan={initialPlan}
      userCount={userCount}
      source={searchParams?.from}
      resultId={searchParams?.resultId}
    />
  );
}
