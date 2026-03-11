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
      
      {/* Owner Story — text-only testimonial, no video */}
      <div className="px-4 pt-8 pb-6">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
          <p className="text-sm text-white/80 leading-relaxed italic">
            &ldquo;My dog is only 2, but I just found out she has exactly 6,434 walks left.
            That&apos;s why I&apos;m tracking her health now — so I can catch the tiny red
            flags years before they become big problems.&rdquo;
          </p>
          <p className="mt-3 text-xs text-white/50">— FursBliss user</p>
        </div>
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
