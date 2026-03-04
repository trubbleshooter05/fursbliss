# FursBliss: Changes 2 & 3 Deployment + User Data Analysis

**Date:** Feb 20, 2026
**Deployed:** ✅ www.fursbliss.com

---

## ✅ CHANGE 2: 30-DAY HISTORY LIMIT (DEPLOYED)

### What Was Implemented
- **Free users** can now only see last 30 days of health tracking history
- Entries older than 30 days are **blurred/locked** with upgrade CTA
- **Meta Pixel event** `HistoryGateHit` fires when users scroll to locked content
- **Upgrade CTA** shows: "Unlock [PetName]'s Full Health Timeline — $9/mo"

### Files Created/Modified
- ✅ `components/pets/health-log-history.tsx` (new client component)
- ✅ `app/(app)/pets/[id]/page.tsx` (integrated history gate)

### How It Works
1. Free users visit `/pets/[id]` page
2. Component calculates cutoff date (30 days ago)
3. Recent logs displayed normally, older logs blurred with lock icon
4. When user scrolls to locked section, Meta Pixel fires `HistoryGateHit` event
5. Upgrade banner shows: "You have [X] older entries from before [date]"

---

## ✅ CHANGE 3: HEALTH ALERTS FOR PREMIUM USERS (DEPLOYED)

### What Was Implemented
1. **Daily email alerts for premium users** when health metrics shift
2. **Dashboard banner for free users** showing what alerts they would have received
3. **Automated cron job** runs daily at 8am UTC

### Files Created/Modified
- ✅ `components/emails/health-alert-email.tsx` (email template with red/yellow/green flags)
- ✅ `app/api/cron/health-alerts/route.ts` (daily cron job)
- ✅ `components/dashboard/missed-alerts-preview.tsx` (free user FOMO banner)
- ✅ `app/(app)/dashboard/page.tsx` (integrated missed alerts banner)
- ✅ `vercel.json` (added cron schedule: `0 8 * * *`)

### How It Works

**For Premium Users:**
1. Cron job runs daily at 8am UTC
2. Fetches all premium users with tracking data
3. Calculates health score changes (yesterday vs today)
4. Identifies red/yellow/green health flags
5. Sends email IF:
   - Red flags exist (urgent)
   - Health score dropped by 10+ points
   - Yellow flags exist AND score dropped by 5+ points
6. Creates notification in database
7. Email shows:
   - Score change (e.g., "75 → 62, -13 points")
   - Red flags: "Urgent attention needed"
   - Yellow flags: "Watch closely"
   - Green flags: "Good news"
   - CTA: "View Full Dashboard"

**For Free Users:**
1. Dashboard calculates what alerts they *would* have received
2. Shows blurred/locked preview of missed alerts
3. Displays: "You missed important health alerts for [PetName]"
4. Lists 2-3 preview alerts (blurred)
5. CTA: "Enable Health Alerts — $9/mo"

---

## 📊 USER DATA ANALYSIS: Where are the "43 registrations"?

### Database (Production Prisma)
```
Total users: 15
Paid users: 5
Unpaid users: 10
Recent unpaid (since Feb 8): 10
Users with pets: 5
```

### Stripe (Production API)
```
Total customers: 9
Active subscriptions: 0
No subscriptions: 9
Recent (since Feb 8): 4
```

### Conclusion: **No 43 registrations found**

**Possible explanations:**
1. **Different environment** - You may be looking at a staging/dev database
2. **Analytics vs actual users** - 43 might be *visitors* or *signup attempts*, not completed registrations
3. **Date range mismatch** - The "43" might include a wider date range
4. **Multiple accounts per user** - Some test accounts (e.g., `trubbleshooter05@gmail.com` appears 3x in Stripe, `maryanneguzman2@gmail.com` appears 2x in Prisma)

### Actual Real Users Worth Contacting (5-6 people)
Based on `production-users.json`:
1. **Joyce Montalbano** (`drjoy2001@verizon.net`) - Toy Poodle, 10 years old
2. **Donna Armey** (`907redes@gmail.com`) - Jasper (Parson Russell Terrier, 5 years old)
3. **Maryanne Guzman** (`maryanneguzman2@gmail.com`) - Daisy (Cockapoo, 19 years old) 🌟 **SENIOR DOG - HIGH VALUE**
4. **Fluffs & Scruffs Dog Rescue** (`fluffsandscruffs@aol.com`) - Basil (Poodle, 10 years old) 🎯 **PARTNERSHIP OPPORTUNITY**

**Excluded (test/debug accounts):**
- `garypandas@yahoo.com`, `garyj9232@gmail.com` (your test accounts)
- `debug_1771789756251@example.net` (obvious debug)
- `support@totalgoodsmarket.com` (generic email)

---

## 🎯 NEXT ACTIONS

### Immediate:
1. **Clarify the "43 registrations"** - Where is this number from?
   - Google Analytics (GA4)?
   - Meta Ads Manager (Lead events)?
   - A different database/environment?
   - A specific date range?

2. **User Outreach** - Once we find the correct 43 users:
   - Use the 3 email templates from `email_outreach_registered_users.md`
   - Send via Resend API or personal email
   - Focus on users with senior dogs (10+ years) for highest conversion

### Later:
1. **Change 4**: Server-side CAPI events for triage/quiz (if still needed)
2. **Monitor health alerts** - Check `/api/cron/health-alerts` logs tomorrow at 8am
3. **A/B test** - 30-day history gate conversion rate

---

## 📂 FILES EXPORTED

- `production-users.json` - Full JSON export (10 unpaid users)
- `production-users.csv` - Spreadsheet format
- `OUTREACH_LIST.md` - Cleaned list with recommendations
- `registered-users.json` - Development DB export (2 users, deprecated)

---

## 🚀 DEPLOYMENT SUMMARY

**Changes Deployed:**
- ✅ Change 2: 30-Day History Limit
- ✅ Change 3: Health Alerts for Premium Users
- ✅ Missed Alerts Preview (free users FOMO)
- ✅ Cron job: `/api/cron/health-alerts` (daily 8am UTC)
- ✅ Meta Pixel: `HistoryGateHit` event

**Live URL:** https://www.fursbliss.com

**Next Deployment:** Change 4 (Server-side CAPI events for triage/quiz) - awaiting confirmation
