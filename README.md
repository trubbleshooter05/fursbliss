# FursBliss

FursBliss is a professional pet health tracking SaaS built with Next.js, Prisma, NextAuth, Stripe, and OpenAI. Track daily wellness, visualize trends, and generate AI-powered supplement recommendations.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM + SQLite (easy to migrate to PostgreSQL)
- NextAuth.js v5 (credentials authentication)
- Stripe subscriptions
- OpenAI GPT-4 recommendations

## Features

- Daily health logs with energy, appetite, mood, and notes
- Pet profiles with symptom tracking
- AI supplement recommendations (premium)
- Stripe Checkout + Customer Portal
- Analytics dashboards with Recharts

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy the sample file and fill in secrets:

```bash
cp .env.example .env.local
```

Required values:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### 3) Run database migrations

```bash
npx prisma migrate dev
```

### 4) Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Stripe Webhooks (Local)

To test webhooks locally, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Production Notes

- Set `NEXTAUTH_SECRET` to a secure random value.
- Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to your production domain.
- Configure Stripe prices and webhook endpoint in the Stripe dashboard.
- Use PostgreSQL by updating `DATABASE_URL` in production.
