import type { Metadata } from "next";
import { PricingPageClient } from "@/components/site/pricing-page-client";
import { prisma } from "@/lib/prisma";

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

type PricingPageProps = {
  searchParams?: {
    plan?: string;
  };
};

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const userCount = await prisma.user.count();
  const initialPlan = searchParams?.plan === "yearly" ? "yearly" : "monthly";
  return <PricingPageClient initialPlan={initialPlan} userCount={userCount} />;
}
