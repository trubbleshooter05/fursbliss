import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { breedPages } from "@/lib/breed-pages";

type PageProps = {
  params: { slug: string };
};

export const revalidate = 86400;

export function generateStaticParams() {
  return breedPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = breedPages.find((entry) => entry.slug === params.slug);
  if (!page) {
    return {
      title: "Breed Guide | FursBliss",
      description: "Breed-specific longevity and supplement guidance.",
      alternates: {
        canonical: `/breeds/${params.slug}`,
      },
    };
  }
  return {
    title: `${page.title} | FursBliss`,
    description: page.description,
    alternates: {
      canonical: `/breeds/${params.slug}`,
    },
    openGraph: {
      title: `${page.title} | FursBliss`,
      description: page.description,
      url: `/breeds/${params.slug}`,
      type: "article",
      images: ["/og-default.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | FursBliss`,
      description: page.description,
      images: ["/og-default.jpg"],
    },
  };
}

export default async function BreedDetailPage({ params }: PageProps) {
  const page = breedPages.find((entry) => entry.slug === params.slug);
  if (!page) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-16 space-y-6">
        <div className="relative h-64 overflow-hidden rounded-3xl border border-border">
          <Image
            src={`https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80&sig=${params.slug.length}`}
            alt={`${page.title} photo`}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/15" />
        </div>
        <h1 className="text-4xl font-semibold text-slate-900">{page.title}</h1>
        <p className="text-muted-foreground">{page.description}</p>

        <Card>
          <CardHeader>
            <CardTitle>Supplement focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {page.focus.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          FursBliss AI and breed content supports owner education and is not a
          substitute for professional veterinary care.
        </p>
        <p className="text-sm">
          <a href="/quiz" className="font-medium text-emerald-700 hover:underline">
            Take the free longevity quiz for a personalized baseline
          </a>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
