import type { Metadata } from "next";
import { PricingPageClient } from "@/components/site/pricing-page-client";

export const metadata: Metadata = {
  title: "FursBliss Pricing — Free Triage & Premium Vet-Ready Plans",
  description:
    "Free 60-second symptom triage and emergency guides, or Premium for full history, downloadable vet-ready reports, and new tools first — from $9/month.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "FursBliss Pricing — Free Triage & Premium Vet-Ready Plans",
    description:
      "Free 60-second symptom triage and emergency guides, or Premium for full history, downloadable vet-ready reports, and new tools first — from $9/month.",
    url: "/pricing",
    type: "website",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FursBliss Pricing — Free Triage & Premium Vet-Ready Plans",
    description:
      "Free 60-second symptom triage and emergency guides, or Premium for full history, downloadable vet-ready reports, and new tools first — from $9/month.",
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
  const showIntroOffer = Boolean(process.env.STRIPE_INTRO_COUPON_ID);
  return (
    <PricingPageClient
      initialPlan={initialPlan}
      userCount={userCount}
      source={searchParams?.from}
      resultId={searchParams?.resultId}
      showIntroOffer={showIntroOffer}
    />
  );
}
