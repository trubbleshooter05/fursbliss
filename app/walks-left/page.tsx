import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WalksLeftCalculator } from "@/components/walks-left/walks-left-calculator";
import { OwnerStoryVideo } from "@/components/video/owner-story-video";

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
      
      {/* Owner Story Video - Above Calculator */}
      <div className="px-4 pt-8 pb-6">
        <OwnerStoryVideo
          videoUrl="/videos/luna-walks-left.mp4"
          thumbnail="/videos/luna-walks-left-thumbnail.jpg"
          ownerName="Greg"
          dogName="Luna"
          caption="Luna is only 2, but I just found out she has exactly 6,434 walks left. That's why I'm tracking her health now — so I can catch the tiny red flags years before they become big problems."
        />
      </div>

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
