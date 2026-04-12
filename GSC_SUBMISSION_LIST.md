# Pages to Submit to Google Search Console

## ✅ BLOG POSTS - Submit These URLs

All blog posts are in `lib/content/blog-posts.ts` (and therefore in `sitemap.xml`). Submit new or high-priority URLs in GSC for faster indexing:

1. **LOY-002 TAS wave / manufacturing next step** (newest)
   ```
   https://www.fursbliss.com/blog/loy-002-tas-wave-manufacturing-next-step
   ```
   Published: Apr 11, 2026

2. **LOY-002 FDA timeline (manufacturing step)**
   ```
   https://www.fursbliss.com/blog/loy-002-fda-timeline
   ```
   Published: Mar 22, 2026

3. **Rapamycin for Dogs Guide**
   ```
   https://www.fursbliss.com/blog/rapamycin-for-dogs-2026-guide
   ```
   Published: Feb 20, 2026

4. **LOY-002 vs Rapamycin Comparison**
   ```
   https://www.fursbliss.com/blog/loy-002-vs-rapamycin-triad-2026-update
   ```
   Published: Feb 14, 2026

5. **Loyal Series C Funding**
   ```
   https://www.fursbliss.com/blog/loyal-series-c-funding-feb-2026
   ```
   Published: Feb 11, 2026

6. **How to Spot Fake Dog Health Advice**
   ```
   https://www.fursbliss.com/blog/how-to-spot-fake-dog-health-advice-social-media
   ```
   Published: Feb 8, 2026

7. **Loyal Series C $100M** (older post)
   ```
   https://www.fursbliss.com/blog/loyal-series-c-100m-loy-002-update
   ```

## ✅ KEY LANDING PAGES - Check if Indexed

These are high-priority pages that should definitely be indexed:

1. **Homepage**
   ```
   https://www.fursbliss.com
   ```

2. **ER Triage Tool** (high priority - conversion page)
   ```
   https://www.fursbliss.com/er-triage-for-dogs
   ```

3. **Quiz** (high priority - conversion page)
   ```
   https://www.fursbliss.com/quiz
   ```

4. **Longevity Drugs Hub** (high value content)
   ```
   https://www.fursbliss.com/longevity-drugs
   ```

5. **LOY-002 Page**
   ```
   https://www.fursbliss.com/loy-002
   ```

6. **Walks Left Calculator** (viral potential)
   ```
   https://www.fursbliss.com/walks-left
   ```

7. **Breeds Hub**
   ```
   https://www.fursbliss.com/breeds
   ```

8. **Symptoms Hub**
   ```
   https://www.fursbliss.com/symptoms
   ```

## ❌ PAGES THAT SHOULD NOT BE INDEXED

These pages are correctly excluded from the sitemap (they're app pages, not content pages):

- `/dashboard` - user dashboard (requires login)
- `/account` - user settings (requires login)
- `/pets/*` - user pet management (requires login)
- `/logs/*` - user health logs (requires login)
- `/admin/*` - admin pages (requires admin auth)
- `/referrals` - user referral dashboard (requires login)
- `/insights` - user insights (requires login)
- `/interaction-checker` - requires login
- `/weekly-checkin/*` - user-specific pages
- `/quiz/results/*` - dynamic user results (requires login)
- `/vet-view/*` - token-based private pages
- `/invite/*` - invite code pages (dynamic)
- `/verify-email` - utility page
- `/reset-password` - utility page
- `/forgot-password` - utility page

## 📊 MISSING FROM SITEMAP

I found one blog post folder that exists but wasn't in the sitemap:
- `loyal-series-c-100m-loy-002-update` - This appears to be a duplicate/old version of the Series C post

**Action needed:** Check if this is a duplicate. If so, delete the folder or redirect it to the main Series C post.

## 🔍 HOW TO SUBMIT TO GOOGLE SEARCH CONSOLE

1. Go to: https://search.google.com/search-console
2. Select your property (fursbliss.com)
3. Click "URL Inspection" in left sidebar
4. Paste each blog post URL above
5. Click "Request Indexing"
6. Repeat for any new or updated URLs (or run **Sitemaps → resubmit** `sitemap.xml` after deploy)

**Priority order (after each deploy):**
1. Newest blog post(s) — e.g. LOY-002 TAS wave (timely news)
2. LOY-002 FDA timeline (pillar timeline content)
3. ER Triage tool (conversion page)
4. Quiz (conversion page)
5. Other blog posts as needed

## ✅ AUTOMATIC INDEXING

Google will automatically discover these via the sitemap within 1-2 weeks, but manual submission speeds it up to 24-48 hours.

Your sitemap is at:
```
https://www.fursbliss.com/sitemap.xml
```

This sitemap is automatically submitted to Google by Next.js and includes:
- All blog posts (now including rapamycin guide)
- All 120+ breed pages
- All 15 symptom pages
- All main landing pages
- Longevity drugs hub
- Quiz, triage, walks-left

**Last updated:** April 11, 2026 (LOY-002 TAS wave post; align list with `blog-posts.ts` + deploy, then GSC URL inspection or sitemap ping)
