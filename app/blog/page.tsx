import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "FursBliss Blog | Dog Longevity News",
  description:
    "Latest dog longevity research, LOY drug updates, and practical senior-dog health guidance.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "FursBliss Blog | Dog Longevity News",
    description:
      "Latest dog longevity research, LOY drug updates, and practical senior-dog health guidance.",
    url: "/blog",
    type: "website",
  },
};

const posts = [
  {
    slug: "loyal-series-c-100m-loy-002-update",
    title: "Loyal Raises $100M Series C: Why It Matters for Dog Longevity",
    excerpt:
      "Loyal announced a $100M Series C on Feb 11, 2026, bringing total funding to $250M+.",
    date: "Feb 11, 2026",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Blog
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            Dog longevity news and guidance
          </h1>
        </div>

        <div className="mt-8 grid gap-5">
          {posts.map((post) => (
            <Card key={post.slug} className="rounded-2xl border-border bg-card">
              <CardHeader className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {post.date}
                </p>
                <CardTitle className="font-display text-2xl">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {post.excerpt}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

