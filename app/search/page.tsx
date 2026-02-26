import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalSearch } from "@/components/site/global-search";
import { getBlogPostsSortedByDateDesc } from "@/lib/content/blog-posts";
import { breedPages } from "@/lib/breed-pages";

export const metadata: Metadata = {
  title: "Search FursBliss",
  description: "Search tools, pages, and guides across FursBliss.",
};

type SearchPageProps = {
  searchParams?: {
    q?: string;
  };
};

type SearchItem = {
  href: string;
  title: string;
  description: string;
  tags?: string[];
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q?.trim().toLowerCase() ?? "";
  const blogPosts = getBlogPostsSortedByDateDesc();

  const coreItems: SearchItem[] = [
    { href: "/", title: "Home", description: "FursBliss homepage and core product overview." },
    { href: "/quiz", title: "Longevity Quiz", description: "Get your dog's readiness score." },
    { href: "/walks-left", title: "Walks Left Tool", description: "Emotional longevity share calculator." },
    { href: "/pricing", title: "Pricing", description: "Free and Premium plan details." },
    { href: "/triage", title: "ER Triage Assistant", description: "Symptom triage and urgency guidance.", tags: ["premium"] },
    { href: "/interaction-checker", title: "Interaction Checker", description: "AI supplement interaction checks.", tags: ["premium"] },
    { href: "/insights", title: "AI Insights", description: "Personalized health and longevity recommendations.", tags: ["premium"] },
    { href: "/loy-002", title: "LOY-002 Hub", description: "Timeline and practical readiness guidance." },
    { href: "/loy-002-waitlist", title: "LOY-002 Waitlist", description: "Eligibility and milestone updates." },
    { href: "/blog", title: "Blog", description: "Longevity explainers and updates." },
    { href: "/breeds", title: "Breed Pages", description: "Breed-specific lifespan and risk guidance." },
  ];

  const blogItems: SearchItem[] = blogPosts.map((post) => ({
    href: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    tags: ["blog"],
  }));

  const breedItems: SearchItem[] = breedPages.slice(0, 120).map((breed) => ({
    href: `/breeds/${breed.slug}`,
    title: breed.title,
    description: breed.description,
    tags: ["breed"],
  }));

  const allItems = [...coreItems, ...blogItems, ...breedItems];
  const filtered = query
    ? allItems.filter((item) => {
        const haystack = `${item.title} ${item.description} ${(item.tags ?? []).join(" ")}`.toLowerCase();
        return haystack.includes(query);
      })
    : allItems.slice(0, 24);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 md:py-14">
        <section className="space-y-3">
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground">Search FursBliss</h1>
          <p className="text-sm text-muted-foreground">
            Find tools, pages, and content quickly.
          </p>
          <GlobalSearch defaultQuery={searchParams?.q ?? ""} />
        </section>

        <Card>
          <CardHeader>
            <CardTitle>
              {query ? `Results for "${searchParams?.q ?? ""}"` : "Popular destinations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matches found. Try a broader search.</p>
            ) : (
              filtered.map((item) => (
                <Link key={`${item.href}-${item.title}`} href={item.href} className="block rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
