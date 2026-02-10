# FursBliss Launch Checklist

## Infra and config
- [ ] Confirm production env vars are present (`DATABASE_URL`, `NEXTAUTH_SECRET`, Stripe, OpenAI, Resend, `CRON_SECRET`).
- [ ] Confirm `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` use `https://www.fursbliss.com`.
- [ ] Confirm `vercel.json` cron is active for `/api/cron/reminders`.
- [ ] Confirm production database has expected seed/reference data.

## Payments and premium gating
- [ ] Verify monthly and yearly checkout links open Stripe Checkout.
- [ ] Verify successful checkout upgrades user to premium.
- [ ] Verify Stripe webhook updates `subscriptionStatus` correctly.
- [ ] Verify premium-only routes return 403 for free users.

## Core user flows
- [ ] Signup -> email verification -> login.
- [ ] Forgot password -> reset -> login.
- [ ] Create pet -> add health log -> see dashboard trend.
- [ ] Run AI insights + save notes.
- [ ] Run interaction checker with structured result.
- [ ] Add dose schedule -> complete/skip on dashboard checklist.
- [ ] Upload photo -> run AI analysis -> copy progress card.
- [ ] Create vet share link -> open public vet view -> add vet comment.
- [ ] Export pet PDF report.

## Public pages and SEO
- [ ] Home, pricing, breeds, community, trends, longevity pages load and link correctly.
- [ ] Sample breed detail pages render metadata and content.
- [ ] Public pages include disclaimers where AI/medical claims appear.

## Operational checks
- [ ] Run local build (`npm run build`) before release.
- [ ] Deploy to production and verify alias points to latest deployment.
- [ ] Review Vercel logs for route failures after release.
- [ ] Monitor first 24h signup, checkout, and API error rates.
