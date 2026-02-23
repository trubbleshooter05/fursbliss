export type BlogPostMeta = {
  title: string;
  slug: string;
  date: string;
  updatedAt?: string;
  excerpt: string;
};

export const blogPosts: BlogPostMeta[] = [
  {
    slug: "how-to-spot-fake-dog-health-advice-social-media",
    title: "How to Spot Fake Dog Health Advice on Social Media",
    excerpt:
      "How to spot scammy supplement claims fast, including the recent mushroom-viral pattern, and use FursBliss checks as a safer next step.",
    date: "2026-02-08",
    updatedAt: "2026-02-08",
  },
  {
    slug: "loy-002-vs-rapamycin-triad-2026-update",
    title: "LOY-002 vs Rapamycin: Two Paths to Dog Longevity",
    excerpt:
      "How Loyal's LOY-002 program compares with Dog Aging Project's TRIAD rapamycin trial across mechanism, eligibility, timeline, and availability.",
    date: "2026-02-14",
    updatedAt: "2026-02-14",
  },
  {
    slug: "loyal-series-c-funding-feb-2026",
    title: "Loyal Raises $100M Series C, Bringing Total Funding to $250M+",
    excerpt:
      "What Loyal's Feb 2026 financing update means for LOY-001, LOY-002, and LOY-003 timelines.",
    date: "2026-02-11",
    updatedAt: "2026-02-11",
  },
];

export function getBlogPostsSortedByDateDesc() {
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
