# FursBliss

FursBliss is a longevity-focused dog wellness platform. It combines daily tracking, AI guidance, drug-readiness monitoring, and vet-shareable reporting in one system.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM + PostgreSQL
- NextAuth v5 (Credentials + Google OAuth)
- Stripe subscriptions (monthly + yearly)
- OpenAI-powered insights and interaction checks
- Resend email notifications

## Product Areas

- Daily health logs (energy, appetite, mood, notes)
- Breed risk timelines and supplement planning
- LOY-002 longevity drug hub with eligibility and status tracking
- AI supplement recommendations and interaction checker
- Dose schedules, reminders, and completion tracking
- Photo timeline + AI observations
- Vet-share links and PDF report export

## Quick Start

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

```bash
cp .env.example .env.local
```

Minimum required:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (for Google sign-in)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_YEARLY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CRON_SECRET`

3) Run migrations

```bash
npx prisma migrate dev
```

4) Seed demo data (optional)

```bash
npm run seed
```

5) Start local app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Stripe Webhook (Local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the generated signing secret to `STRIPE_WEBHOOK_SECRET`.

## Security Notes

- Never commit local database files (`*.db`, `*.sqlite`).
- Never commit `.env.local` or `.env.production`.
- Use strong `NEXTAUTH_SECRET` and `CRON_SECRET` in production.
