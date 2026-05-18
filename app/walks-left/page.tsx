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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How many walks does a dog need per day?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most dogs need 2–3 walks per day, totaling 30–60 minutes of activity. The exact amount depends on breed, age, and health. High-energy breeds like Border Collies may need 2+ hours; senior or brachycephalic dogs may need shorter, gentler walks.",
      },
    },
    {
      "@type": "Question",
      name: "How many years do dogs live on average?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most dogs live 10–13 years, though this varies significantly by size and breed. Small dogs often live 14–16 years, large breeds average 8–10 years, and giant breeds may only reach 6–8 years.",
      },
    },
    {
      "@type": "Question",
      name: "How can I make the most of my remaining time with my dog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Track your dog's health proactively, maintain regular vet visits, optimize their nutrition and exercise, and consider longevity supplements. Starting health tracking early — before problems arise — gives you the best chance to extend and improve your dog's life.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Walks Left calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Walks Left calculator estimates how many walks, weekends, and sunsets remain with your dog based on their breed and current age. It's a way to visualize your time together and motivate proactive health tracking.",
      },
    },
  ],
};

export default function WalksLeftPage({ searchParams }: WalksLeftPageProps) {
  return (
    <div className="min-h-screen bg-[#12091f]">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      
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
