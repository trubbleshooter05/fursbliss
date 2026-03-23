export type BlogPostMeta = {
  title: string;
  slug: string;
  date: string;
  updatedAt?: string;
  excerpt: string;
};

export const blogPosts: BlogPostMeta[] = [
  {
    slug: "loy-002-fda-timeline",
    title: "LOY-002 FDA Approval Timeline: Manufacturing & Realistic Dates (2026–2028)",
    excerpt:
      "RXE and Target Animal Safety are cleared; CMC (manufacturing) is the last FDA section — expected 2027. What “LOY-002 approval date” really means and what to do while you wait.",
    date: "2026-03-22",
    updatedAt: "2026-03-22",
  },
  {
    slug: "rapamycin-for-dogs-2026-guide",
    title: "Rapamycin for Dogs in 2026: What Every Senior Dog Owner Should Know",
    excerpt:
      "Rapamycin is already being prescribed off-label for dogs. Here's what the research shows, what it costs, the risks, and how it compares to LOY-002.",
    date: "2026-02-20",
    updatedAt: "2026-02-20",
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
  {
    slug: "how-to-spot-fake-dog-health-advice-social-media",
    title: "How to Spot Fake Dog Health Advice on Social Media",
    excerpt:
      "How to spot scammy supplement claims fast, including the recent mushroom-viral pattern, and use FursBliss checks as a safer next step.",
    date: "2026-02-08",
    updatedAt: "2026-02-08",
  },
];

export function getBlogPostsSortedByDateDesc() {
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
