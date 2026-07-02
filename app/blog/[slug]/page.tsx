import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { BlogBottomCTA } from "@/components/blog/blog-bottom-cta";
import {
  getGeneratedBlogPost,
  getGeneratedBlogSlugs,
} from "@/lib/generated-blog";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getGeneratedBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getGeneratedBlogPost(params.slug);
  if (!post) return { title: "Not found | FursBliss" };
  return {
    title: `${post.title} | FursBliss`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      images: ["/og-default.jpg"],
    },
  };
}

export default function GeneratedBlogPostPage({ params }: Props) {
  const post = getGeneratedBlogPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "FursBliss" },
    mainEntityOfPage: `https://www.fursbliss.com/blog/${post.slug}`,
  };

  const dateLabel = post.publishedAt.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Blog · {dateLabel}
          </p>
          <h1 className="font-display text-4xl tracking-[-0.03em] text-foreground md:text-5xl">
            {post.title}
          </h1>
          <p className="text-muted-foreground">{post.description}</p>
        </div>
        <Card className="mt-8 rounded-2xl border-border bg-card">
          <CardContent className="prose prose-neutral max-w-none p-6 dark:prose-invert md:p-10">
            <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          </CardContent>
        </Card>
        {post.cta ? <p className="mt-6 text-muted-foreground">{post.cta}</p> : null}
        <BlogBottomCTA slug={post.slug} />
        <p className="mt-8">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to blog
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
