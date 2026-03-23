# Google Search Console & DNS Fix — "Old Site" Still Showing

## What’s Actually Happening

**Live site is correct.** Both `https://fursbliss.com` and `https://www.fursbliss.com` serve the new longevity platform. The apex domain redirects (308) to www, and old Shopify-style URLs (`/products`, `/collections`, `/cart`, etc.) redirect to the homepage.

**The problem is Google’s index.** Search results and GSC are still showing old content (pet grooming / product site) because Google hasn’t fully recrawled and reindexed yet.

---

## 1. DNS Check (Current State)

| Record | Current Value | Status |
|--------|---------------|--------|
| `fursbliss.com` (apex) | A → 216.198.79.1 (Vercel) | ✅ Correct |
| `www.fursbliss.com` | CNAME → vercel-dns | ✅ Correct |

The apex domain is reaching Vercel and redirecting (308) to www. Both resolve to Vercel. If you ever see the old site on `fursbliss.com`, it’s likely:

- Local DNS cache
- ISP/CDN cache
- Old DNS at your registrar (e.g. GoDaddy) still pointing to the old host

---

## 2. Fix Google Search Console (Old Content)

### A. Request Reindexing for Key URLs

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select the **Domain property** (`fursbliss.com`)
3. Use **URL Inspection** (top search bar)
4. Enter: `https://www.fursbliss.com`
5. Click **Request indexing**
6. Repeat for:
   - `https://www.fursbliss.com/quiz`
   - `https://www.fursbliss.com/er-triage-for-dogs`
   - `https://www.fursbliss.com/loy-002`
   - `https://www.fursbliss.com/blog`

**Note:** There’s a quota per property. Use it for your most important pages.

### B. Refresh Outdated Content (If Applicable)

If Google shows old snippets for pages that have changed a lot:

1. GSC → **Removals** (left sidebar)
2. **New request** → **Remove outdated content**
3. Enter the URL where Google shows old content
4. Submit

Use this when the live page is correct but the snippet/title/description in search is wrong.

### C. Sitemap

1. GSC → **Sitemaps**
2. Ensure only `https://www.fursbliss.com/sitemap.xml` is submitted
3. Remove any `https://fursbliss.com/sitemap.xml` (non‑www) if present

---

## 3. DNS Verification in GSC

### Domain Property (`fursbliss.com`)

- Uses a **TXT record** for verification
- Covers both www and non‑www
- Preferred property for reporting

### URL-Prefix Property (`https://fursbliss.com/`)

- `fursbliss.com` 308‑redirects to www
- Google may treat this as a redirect, not the canonical URL
- Consider removing this property and using only the Domain property

---

## 4. Vercel Domain Setup

In [Vercel Dashboard](https://vercel.com) → Project → Settings → Domains:

- `fursbliss.com` (apex) — should be configured
- `www.fursbliss.com` — should be configured

Both should show as valid. If apex shows a warning, Vercel will show the exact DNS records to add.

---

## 5. Registrar DNS (If You Manage DNS There)

If DNS is at your registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**Apex (`fursbliss.com`):**

- **Option A:** A record → `76.76.21.21` (Vercel’s apex IP)
- **Option B:** ALIAS/ANAME → `cname.vercel-dns.com`

**www:**

- CNAME → `cname.vercel-dns.com`

If the apex still points to an old host IP, update it to Vercel’s values above.

---

## 6. Timeline

- DNS changes: usually 5–60 minutes, up to 24–48 hours
- Google recrawling: days to a few weeks
- Full reindexing: can take 2–4 weeks

---

## 7. Quick Checklist

- [ ] Request indexing for `https://www.fursbliss.com` and main pages in GSC
- [ ] Submit sitemap `https://www.fursbliss.com/sitemap.xml` in Domain property
- [ ] Remove outdated content for URLs with wrong snippets (if needed)
- [ ] Confirm apex DNS at registrar points to Vercel (76.76.21.21 or ALIAS)
- [ ] Confirm both domains are valid in Vercel project settings
