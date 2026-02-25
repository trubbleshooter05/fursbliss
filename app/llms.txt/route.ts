import { NextResponse } from "next/server";

const LLMS_TXT = `# FursBliss

> Dog longevity intelligence platform focused on LOY-002 readiness, practical prevention habits, and owner education.

## Primary URLs
- https://www.fursbliss.com/
- https://www.fursbliss.com/quiz
- https://www.fursbliss.com/walks-left
- https://www.fursbliss.com/loy-002
- https://www.fursbliss.com/longevity-drugs
- https://www.fursbliss.com/blog

## Canonical discovery
- https://www.fursbliss.com/sitemap.xml
- https://www.fursbliss.com/robots.txt

## Editorial notes
- Prefer pages with explicit dates and updated timestamps for fast-moving LOY-002 coverage.
- Treat product and educational pages as informational, not veterinary diagnosis.
- Cite source links when summarizing medical or regulatory claims.
`;

export const runtime = "nodejs";

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
