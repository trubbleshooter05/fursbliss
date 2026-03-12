# SEO & Google Analytics Fix Guide

## 1. Google Analytics — "Data collection isn't active"

### Root cause
Your GA4 stream is set to `https://fursbliss.com`, but Vercel redirects all traffic to `https://www.fursbliss.com`. GA4 may not match data when the stream URL doesn't match where the tag actually fires.

### Fix (do these in order)

**Step A: Update the GA4 stream URL**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Admin (gear icon) → Data streams → click your `fursbliss.com` web stream
3. Click the pencil icon to edit
4. Change **Stream URL** from `https://fursbliss.com` to `https://www.fursbliss.com`
5. Save

**Step B: Trigger a Vercel redeploy**
1. Vercel → fursbliss project → Deployments
2. Click the ⋮ menu on the latest deployment → Redeploy
3. This ensures `NEXT_PUBLIC_GA_MEASUREMENT_ID` is baked into the build

**Step C: Verify in Realtime**
1. GA4 → Reports → Realtime (left sidebar)
2. Open a new incognito window (to avoid ad blockers)
3. Visit `https://www.fursbliss.com`
4. Within ~30 seconds you should see "1 user" in Realtime

**If still not working**
- Disable ad blockers (uBlock, Privacy Badger, etc.) when testing
- Use Chrome DevTools → Network tab → filter by "google" or "gtag" — you should see requests to googletagmanager.com
- Check that `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set for **Production** in Vercel (you have it for Dev, Prod, Preview — good)

---

## 2. Google Search Console — Two properties (www vs non-www)

### Current setup
- **Domain property**: `fursbliss.com` (covers both www and non-www)
- **URL-prefix property**: `https://fursbliss.com/`

### Recommendation
**Use the Domain property** for all reporting. It aggregates data from both www and non-www.

**Sitemap**
- In the **Domain property** (`fursbliss.com`): Submit only `https://www.fursbliss.com/sitemap.xml`
- Remove the non-www sitemap (`https://fursbliss.com/sitemap.xml`) from the URL-prefix property if you want to simplify — or leave both; the domain property will use the www one

**Optional cleanup**
- You can remove the URL-prefix property (`https://fursbliss.com/`) if you prefer a single property
- Or keep both; the domain property is the one that matters for SEO

---

## 3. Sitemap — Chrome extension script in XML

The `<script src="chrome-extension://...">` you saw inside the sitemap is **injected by a Chrome extension** when you view the page in the browser. The actual sitemap served by the server does not include it. You can confirm by:
- Viewing `https://www.fursbliss.com/sitemap.xml` in an incognito window (extensions disabled)
- Or using `curl https://www.fursbliss.com/sitemap.xml` in Terminal

The sitemap content itself is correct (154+ URLs, all www.fursbliss.com).

---

## 4. Coverage issues (3.41K not indexed)

From your Critical issues CSV:
- **Alternate page with proper canonical** — Expected; these are duplicates that correctly point to a canonical URL
- **Excluded by noindex** — Expected for login, signup, dashboard, etc.
- **403 / 404** — Some may be auth-gated or old URLs; review if any are important pages
- **Server error (5xx)** — 2 pages; could be the sitemap or transient errors — worth monitoring

**Action**: Focus on the **73 indexed** pages. The "not indexed" counts include many that are intentionally excluded. Over time, as you fix 404s and reduce 5xx, indexing should improve.
