# Technical SEO Audit Checklist

Use this as a release gate for marketing and content updates.

## P0 (must pass)

- [ ] Canonical host is consistent (`https://www.fursbliss.com`) across metadata, sitemap, robots, and schema.
- [ ] `robots.txt` allows public pages and disallows private app areas (`/dashboard`, `/pets`, `/account`, `/api`, `/admin`).
- [ ] `sitemap.xml` includes all priority money pages and current blog URLs.
- [ ] Noindex is set where required (share/result helper pages that should not index).
- [ ] Top landing pages return 200, are not blocked, and have valid canonical tags.

## P1 (strongly recommended)

- [ ] High-intent pages include complete Open Graph + Twitter metadata.
- [ ] Structured data is present and valid for key page types (`Organization`, `WebSite`, `Article`, `FAQPage` where appropriate).
- [ ] Internal links connect homepage/tool pages to quiz, LOY-002 pages, and relevant blog posts.
- [ ] Content pages contain unique H1, unique meta description, and descriptive anchor text.
- [ ] Largest content pages are statically generated or ISR when possible.

## P2 (ongoing optimization)

- [ ] Refresh older posts with new numbers, references, and `updatedAt`.
- [ ] Add comparison/intent pages for terms users actually search.
- [ ] Expand FAQ sections from real user objections seen in comments/support.
- [ ] Validate share previews after metadata updates (Facebook debugger / social validators).
- [ ] Track index coverage and impressions weekly in Search Console.

## Release note format

For each ship, log:

- Scope changed
- Pages impacted
- Expected SEO/GEO outcome
- Reindex candidates (priority 5 URLs)
