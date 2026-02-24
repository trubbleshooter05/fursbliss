import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WalksLeftCalculator } from "@/components/walks-left/walks-left-calculator";

type WalksLeftPageProps = {
  searchParams?: {
    name?: string;
    breed?: string;
  };
};

export const metadata: Metadata = {
  title: "How Many Walks Left With Your Dog? | Free Calculator — FursBliss",
  description:
    "Find out exactly how many walks, weekends, and sunsets you have left with your dog. A free tool every dog owner needs to see.",
  alternates: {
    canonical: "/walks-left",
  },
  openGraph: {
    title: "How Many Walks Left With Your Dog? | Free Calculator — FursBliss",
    description:
      "Find out exactly how many walks, weekends, and sunsets you have left with your dog. A free tool every dog owner needs to see.",
    url: "/walks-left",
    type: "website",
    images: ["/walks-left/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Many Walks Left With Your Dog? | Free Calculator — FursBliss",
    description:
      "Find out exactly how many walks, weekends, and sunsets you have left with your dog. A free tool every dog owner needs to see.",
    images: ["/walks-left/opengraph-image"],
  },
};

export default function WalksLeftPage({ searchParams }: WalksLeftPageProps) {
  return (
    <div className="min-h-screen bg-[#12091f]">
      <SiteHeader />
      <WalksLeftCalculator
        prefill={{
          name: searchParams?.name,
          breed: searchParams?.breed,
        }}
      />
      <SiteFooter />
    </div>
  );
}
