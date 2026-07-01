import postsFile from "@/content/blog/generated-posts.json";

export type GeneratedBlogPost = {
  slug: string;
  title: string;
  description: string;
  contentMarkdown: string;
  contentHtml: string;
  keywords: string[];
  cta: string;
  audience: string;
  internalLinks: { text: string; url: string }[];
  publishedAt: string;
  url: string;
};

type PostsFile = { posts: GeneratedBlogPost[] };

const data = postsFile as PostsFile;

export function getGeneratedBlogPosts(): GeneratedBlogPost[] {
  return [...(data.posts ?? [])].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getGeneratedBlogPost(slug: string): GeneratedBlogPost | null {
  return getGeneratedBlogPosts().find((p) => p.slug === slug) ?? null;
}

export function getGeneratedBlogSlugs(): string[] {
  return getGeneratedBlogPosts().map((p) => p.slug);
}
