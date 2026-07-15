# FursBliss analytics & UTM guide

## GA4

- Measurement ID: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (prod: `G-4C2EJL2XPS`)
- Measurement Protocol secret: `GA4_MEASUREMENT_PROTOCOL_SECRET` (required for server purchase events)
- Client pageviews: single `page_view` via `GoogleAnalytics` (init uses `send_page_view: false`)
- Exclusions: localhost, `*.vercel.app` preview, admin cookie `fb_ga_exclude=1`

## Required funnel events

| Event | Client | Server (webhook / checkout API) |
|-------|--------|----------------------------------|
| pricing_viewed | yes | — |
| signup_started / signup_completed | yes | — |
| cta_clicked | yes (on checkout CTAs) | — |
| checkout_started | yes + MP | Stripe checkout create |
| checkout_completed / purchase / subscription_started | yes + MP beacon | Stripe `checkout.session.completed` |
| checkout_abandoned | cancel landing + | Stripe `checkout.session.expired` |

## UTM formats (use `buildUtmUrl` / `UTM_PRESETS` in `lib/ga-tracking.ts`)

Base: `https://www.fursbliss.com/PATH?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN`

| Channel | Example |
|---------|---------|
| YouTube | `?utm_source=youtube&utm_medium=social&utm_campaign=fursbliss_growth` |
| TikTok | `?utm_source=tiktok&utm_medium=social&utm_campaign=fursbliss_growth` |
| Instagram | `?utm_source=instagram&utm_medium=social&utm_campaign=fursbliss_growth` |
| Reddit | `?utm_source=reddit&utm_medium=social&utm_campaign=fursbliss_growth` |
| Email | `?utm_source=email&utm_medium=email&utm_campaign=fursbliss_growth` |
| Direct outreach | `?utm_source=outreach&utm_medium=community&utm_campaign=fursbliss_growth` |
| FB Page daily | `?utm_source=fb-page&utm_medium=social&utm_campaign=daily-content` |
| FB groups | `?utm_source=fb-senior-dog&utm_medium=social&utm_campaign=community` |

Always link to a real landing path (`/`, `/pricing`, `/check`, `/signup`) — never a bare domain with no path if you need first-touch UTMs stored.

## Verify

### GA4 DebugView
1. Open `https://www.fursbliss.com/pricing?ga_debug=1`
2. GA4 Admin → DebugView
3. Confirm `page_view`, `pricing_viewed`, then click checkout → `cta_clicked`, `checkout_started`

### Stripe test mode
1. Use test keys + test webhook forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Complete a test Checkout
3. Confirm webhook logs `purchase` / `subscription_started` MP calls (needs `GA4_MEASUREMENT_PROTOCOL_SECRET`)
4. Cancel a Checkout → land on `/pricing?checkout=cancelled` → `checkout_abandoned`
