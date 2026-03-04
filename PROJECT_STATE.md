# FursBliss - Current Project State

## ACTIVE SPRINT (Updated: March 4, 2026)
**Current Focus:** Health Alert System + Weekly Check-In Habit Loop  
**Target Completion:** March 9, 2026 (first weekly check-in email sends Sunday 9am UTC)

## COMPLETED THIS WEEK (March 4, 2026)

### Feature 1: Quiz + Triage + Homepage Improvements
- [x] Quiz progress bar enhanced (Question X of Y, time remaining, encouragement)
- [x] Quiz reduced to 3 questions (90 seconds total)
- [x] Post-triage 3-day check-in CTA added
- [x] Homepage hero rewritten (fear-based urgency messaging)
- [x] Homepage CTA changed to "Check Your Dog Now"

### Feature 2: Free vs Paid Tier System
- [x] Tier limits defined: Free (1 dog, 30-day history, no alerts) vs Premium (unlimited)
- [x] Subscription utility with TIER_LIMITS constants and helper functions
- [x] TierGatePrompt component (6 gate types: second-pet, old-history, health-alerts, etc.)
- [x] 1 dog limit enforced in API (app/api/pets/route.ts)
- [x] 30-day history limit with blur UI (components/pets/health-log-history.tsx)
- [x] Vet report paywall (components/pets/vet-report-export-button.tsx)
- [x] Pattern detection with tier gating

### Feature 3: Weekly Check-In System
- [x] WeeklyCheckIn database table with migration
- [x] Weekly check-in email template (Sunday 9am)
- [x] Check-in form (4 questions: symptoms, energy, appetite, vet visits)
- [x] Week-over-week comparison logic (lib/week-comparison.ts)
- [x] Results page showing improvements/declines
- [x] Cron job configured (Sunday 9am UTC in vercel.json)
- [x] API endpoints (GET/POST /api/weekly-checkin)
- [x] Routes: /weekly-checkin/[dogId] and /weekly-checkin/[dogId]/results

### Feature 4: Dashboard Health Alert System
- [x] HealthAlert database table with migration
- [x] Alert calculation logic (lib/health-alerts.ts) - red/yellow/green rules
- [x] AlertCard component at top of dashboard
- [x] Tier gating (free users see blurred preview)
- [x] Urgent symptom detection (immediate red alert even with 1 log)
- [x] Fixed to check both symptoms AND notes fields
- [x] Enhanced pattern detection (weight trends + symptom combos)
- [x] Deployed and tested

### Feature 5: Project State Tracking
- [x] PROJECT_STATE.md created for cross-session context
- [x] All architecture, files, and decisions documented

## IN PROGRESS
- [ ] Monitoring first deployment of health alerts (waiting for user refresh)
- [ ] Weekly check-in emails will auto-send Sunday March 9 at 9am UTC

## BLOCKED/WAITING
- None currently

## NEXT UP (Backlog)
1. **Audit & Integration Check** (CURRENT - March 4)
   - Verify tier restrictions are enforced everywhere
   - Check email system for conflicts/spam
   - Validate payment flow end-to-end
   - Test all upgrade prompts
2. Monitor first batch of weekly check-in emails (Sunday March 9)
3. Track conversion metrics from health alerts
4. A/B test alert messaging (fear vs reassurance)
5. Add email notification when alert level changes (red → green)
6. Mobile app push notifications for alerts
7. Consolidate email sequences (avoid spam)
8. Add subscription management page (cancel, change plan)
9. Build admin dashboard for monitoring metrics

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
4. ~~**3-day check-in has no backend logic**~~ - FIXED: Removed fake promise, now just links to dashboard
5. ~~**Email consolidation needed**~~ - FIXED: Weekly check-ins now premium-only (prevents spam)
6. **No subscription management UI** - Users can't cancel/change plans from dashboard (must go to Stripe portal)
7. **Weekly check-ins not used in alert calculation** - WeeklyCheckIn table exists but alerts only read HealthLog
8. **Missing database index on HealthLog** - Need (petId, date) index for alert performance

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
6. **Build failure (check-email-sequence.ts)** - Deleted script with missing dependency
7. **Vercel build (prisma migrate)** - Added vercel-build script to skip auto-migrations
8. **Radio button component missing** - Created components/ui/radio-group.tsx
9. **CRITICAL: Weekly check-ins going to free users** - Added premium-only filter to cron job
10. **CRITICAL: 3-day check-in fake promise** - Removed fake "Set My 3-Day Check-In" CTA, replaced with honest "Go to Dashboard"

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
