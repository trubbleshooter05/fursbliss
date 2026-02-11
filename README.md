# FursBliss

## Overview

FursBliss is a **Pet Longevity Intelligence Platform** that helps pet parents and care teams monitor daily health signals, personalize longevity interventions, and prepare for emerging longevity therapeutics.

The product combines AI-assisted decision support, structured health tracking, and subscription-powered premium workflows in a single App Router experience.

## Core Features

- **LOY-001 / LOY-002 / LOY-003 Drug Hub**
  - Timeline tracking, milestone updates, and eligibility readiness workflows.
- **Breed-Specific Longevity Intelligence**
  - 100+ SEO-indexable breed pages with risk and supplement focus context.
- **Supplement Tracking**
  - Dose schedules, completion logs, and daily adherence support.
- **Interaction Checks**
  - AI-assisted supplement and medication interaction analysis.
- **Photo Tracking**
  - Longitudinal photo logs with AI observation support.
- **Premium Subscription Model**
  - Stripe-powered monthly/yearly plans, gated premium features, and billing portal access.

## Tech Stack

- **Framework:** Next.js 14 (App Router), React, TypeScript
- **Data Layer:** Prisma ORM, PostgreSQL
- **Auth:** NextAuth (credentials + Google OAuth)
- **Billing:** Stripe subscriptions + webhooks
- **AI:** OpenAI API
- **Email:** Resend
- **UI:** Tailwind CSS, shadcn/ui
- **Deploy:** Vercel

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Apply schema changes:

```bash
npx prisma migrate dev
```

4. (Optional) Seed sample data:

```bash
npm run seed
```

5. Run the app:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

Use `.env.local` for local development and configure matching values in Vercel for preview/production.

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_YEARLY`
- `STRIPE_PRICE_ID`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CRON_SECRET`
- `DEMO_EMAIL`
- `DEMO_PASSWORD`
- `DEMO_SEED_SECRET`

## Deployment

FursBliss is designed for Vercel deployment:

1. Configure all required environment variables in Vercel.
2. Run Prisma migrations against the target database.
3. Deploy using Vercel Git integration or CLI:

```bash
vercel --prod
```

4. Validate key production flows:
   - Signup/login (credentials + Google OAuth)
   - Stripe checkout (monthly + yearly)
   - Drug hub pages and waitlist capture
   - API health and cron-backed reminders
