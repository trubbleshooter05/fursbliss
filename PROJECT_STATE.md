# FursBliss - Current Project State

## ACTIVE SPRINT (Updated: March 4, 2026)
**Current Focus:** Health Alert System + Weekly Check-In Habit Loop  
**Target Completion:** March 9, 2026 (first weekly check-in email sends Sunday 9am UTC)

## COMPLETED THIS WEEK
- [x] Tier restructuring (free vs paid) - 1 dog limit, 30-day history, no alerts for free
- [x] Enhanced pattern detection (weight trends + dangerous symptom combinations)
- [x] Weekly check-in system (Sunday 9am emails)
- [x] Week-over-week comparison logic
- [x] Red/yellow/green health alert dashboard card
- [x] Urgent symptom detection (vomiting, seizure, etc.) - triggers immediate red alert
- [x] Fixed alert system to check both symptoms AND notes fields
- [x] HealthAlert database table
- [x] AlertCard component with tier gating
- [x] Migration applied to production

## IN PROGRESS
- [ ] Waiting for Vercel deployment to complete (~2-3 min) - Red alert should show for "vomiting" logs
- [ ] Weekly check-in emails (will auto-send Sunday March 9 at 9am UTC)

## BLOCKED/WAITING
- None currently

## NEXT UP (Backlog)
1. Monitor first batch of weekly check-in emails (Sunday 9am)
2. Track conversion metrics from health alerts
3. A/B test alert messaging
4. Add more pattern detection types if needed
5. Mobile app push notifications for alerts

## ARCHITECTURE DECISIONS
- **Database:** PostgreSQL via Prisma (hosted at db.prisma.io)
- **Auth:** NextAuth v5 (beta)
- **Email:** Resend API
- **Payments:** Stripe (monthly $9, yearly $59)
- **Deployment:** Vercel
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components

## KNOWN ISSUES
1. **Weekly check-in cron manual trigger fails with 401** - This is expected, Vercel's cron system handles auth differently. Will work automatically on Sunday.
2. **Prisma migration drift warnings** - Ignore for now, production DB is up to date
3. **Meta CAPI events not showing in Events Manager** - Tracking implemented but may have delay

## KEY FILES LOCATIONS

### Core Features
- **Dashboard:** `app/(app)/dashboard/page.tsx`
- **Health Alert Logic:** `lib/health-alerts.ts`
- **Pattern Detection:** `lib/pattern-detection.ts`
- **Week Comparison:** `lib/week-comparison.ts`
- **Health Score:** `lib/health-score.ts`
- **Subscription/Tier Logic:** `lib/subscription.ts`

### Components
- **AlertCard:** `components/dashboard/alert-card.tsx`
- **HealthScorePanel:** `components/dashboard/health-score-panel.tsx`
- **PatternAlertsCard:** `components/dashboard/pattern-alerts-card.tsx`
- **MissedAlertsPreview:** `components/dashboard/missed-alerts-preview.tsx`
- **TierGatePrompt:** `components/upgrade/tier-gate-prompt.tsx`
- **WeeklyCheckInForm:** `components/weekly-checkin/weekly-checkin-form.tsx`

### Email Templates
- **Weekly Check-In:** `components/emails/weekly-checkin-email.tsx`
- **Health Alert:** `components/emails/health-alert-email.tsx`

### API Routes
- **Weekly Check-In API:** `app/api/weekly-checkin/route.ts`
- **Stripe Checkout:** `app/api/stripe/checkout/route.ts`
- **ER Triage:** `app/api/ai/er-triage/route.ts`
- **Quiz Submit:** `app/api/quiz/submit/route.ts`

### Cron Jobs
- **Weekly Check-In:** `app/api/cron/weekly-checkin/route.ts` (Sunday 9am UTC)
- **Health Alerts:** `app/api/cron/health-alerts/route.ts` (Daily 8am UTC)
- **Email Drip:** `app/api/cron/email-drip/route.ts` (Daily 2pm UTC)

### Pages
- **Weekly Check-In Form:** `app/(app)/weekly-checkin/[dogId]/page.tsx`
- **Check-In Results:** `app/(app)/weekly-checkin/[dogId]/results/page.tsx`
- **Pet Details:** `app/(app)/pets/[id]/page.tsx`
- **Triage:** `app/(app)/er-triage-for-dogs/page.tsx` (static)
- **Quiz:** `app/(app)/quiz/page.tsx`
- **Pricing:** `app/(app)/pricing/page.tsx`

### Database Schema
- **Schema:** `prisma/schema.prisma`
- **Main Models:** User, Pet, HealthLog, WeeklyCheckIn, HealthAlert, Notification, QuizSubmission

### Documentation
- **Tier Restructure:** `TIER_RESTRUCTURE_SUMMARY.md`
- **Weekly Check-In:** `WEEKLY_CHECKIN_SUMMARY.md`
- **Deployment:** `DEPLOYMENT_SUMMARY.md`

## TIER LIMITS (Free vs Paid)

### FREE TIER
- 1 dog only
- Last 30 days of history
- No health alerts (see blurred preview)
- No pattern detection details
- No vet PDF reports
- Basic logging and symptom checker

### PREMIUM TIER ($9/mo or $59/yr)
- Unlimited dogs
- Full history forever
- Red/yellow/green health alerts
- Pattern detection with details
- Vet-ready PDF exports
- Medication tracking
- Weekly check-in emails

## HEALTH ALERT RULES

### 🔴 RED ALERTS (Urgent)
- Symptom logged 5+ times in 7 days
- Urgent symptoms (any occurrence): vomiting, not eating, seizure, difficulty breathing, collapse, blood
- Rapid weight loss (>5% in 1 week)
- **Action:** "Consider calling your vet today"

### 🟡 YELLOW ALERTS (Monitor)
- Symptom logged 3-4x this week (up from <2 last week)
- Gradual weight loss (>2% in 1 week)
- Energy marked low 4+ days in a row
- Any symptom increasing week-over-week
- **Action:** "Continue monitoring. Alert your vet if it worsens"

### 🟢 GREEN (All Clear)
- No concerning patterns detected
- **Action:** "Keep up the tracking!"

## RECENT FIXES (Last Session - March 4, 2026)
1. **Red alert not showing** - Fixed to check notes field (not just symptoms)
2. **Required 3 days of data** - Changed to 1 day for urgent symptoms
3. **Added notes field to HealthLogEntry type**
4. **Updated dashboard query to include notes**
5. **Changed alert check threshold from 3 to 1 for urgent symptoms**

## ENVIRONMENT VARIABLES (Production)
- `RESEND_API_KEY` - Email sending
- `STRIPE_SECRET_KEY` - Payment processing
- `CRON_SECRET` - Cron job authorization
- `NEXT_PUBLIC_APP_URL` - App base URL
- `META_PIXEL_ID` - Meta Pixel tracking
- `META_PIXEL_ACCESS_TOKEN` - Meta Conversions API
- `OPENAI_API_KEY` - AI features

## DEPLOYMENT CHECKLIST
- [x] Prisma generate
- [x] Build succeeds
- [x] Migrations applied (`npx prisma migrate deploy`)
- [x] Git commit + push
- [x] Vercel auto-deploys
- [ ] Test in production (~2-3 min after push)

## USER TESTING NOTES
- **Primary test user:** Luna (dog)
- **Current test:** Vomiting logged in notes field
- **Expected result:** Red alert should appear at top of dashboard after deployment

---

## NOTES FOR CURSOR AI

**IMPORTANT:** 
- Read this file at the START of every new session
- Update this file at the END of every session with completed tasks
- Move "IN PROGRESS" items to "COMPLETED" when done
- Add new blockers/issues as they arise
- Keep "ACTIVE SPRINT" current with what we're working on this week

**Last Updated:** March 4, 2026, 1:10 PM PST
