# Free vs Paid Tier Restructuring — Implementation Summary

## Overview
Restructured FursBliss to create stronger upgrade pressure by limiting free tier features while keeping it useful enough to demonstrate value.

---

## New Tier Structure

### FREE TIER (Limited but useful)
✅ **What's included:**
- Track **1 dog only**
- **Last 30 days of history** (older data is locked/blurred)
- Symptom checker works
- Basic health logging
- ER triage tool
- Health score dashboard (read-only)

❌ **Premium-only features:**
- Unlimited dogs
- Full history forever
- **Red/Yellow/Green health alert system**
- **Behavior pattern detection** (e.g., "⚠️ Limping logged 4x this week, up from 1x")
- Vet-ready PDF reports
- Medication tracking

### PAID TIER ($9/month or $59/year)
✅ **Everything in free, PLUS:**
- Unlimited dogs
- Full health history forever
- **Pattern detection alerts** when behavior frequency changes
- **Health score alerts** when metrics shift
- Vet-ready PDF exports
- Medication/supplement tracking

---

## Implementation Details

### 1. Subscription Utility (`lib/subscription.ts`)
Added tier restriction constants and helper functions:

```typescript
export const TIER_LIMITS = {
  FREE: {
    MAX_PETS: 1,
    HISTORY_DAYS: 30,
    HEALTH_ALERTS: false,
    PATTERN_DETECTION: false,
    VET_REPORTS: false,
    MEDICATION_TRACKING: false,
  },
  PREMIUM: {
    MAX_PETS: Infinity,
    HISTORY_DAYS: Infinity,
    HEALTH_ALERTS: true,
    PATTERN_DETECTION: true,
    VET_REPORTS: true,
    MEDICATION_TRACKING: true,
  },
}

// Helper functions
canAddPet(currentPetCount, isPremium)
canAccessHealthAlerts(isPremium)
canAccessPatternDetection(isPremium)
canDownloadVetReport(isPremium)
canAccessMedicationTracking(isPremium)
getHistoryDaysLimit(isPremium)
```

### 2. Pattern Detection System (`lib/pattern-detection.ts`)
New module that analyzes behavior frequency changes:

**Detects:**
- Symptom frequency increases (e.g., "Limping 4x this week vs 1x last week")
- Low energy frequency changes
- Poor appetite frequency changes
- Reduced mobility frequency changes

**Alert types:**
- **Red flags**: 4+ occurrences per week
- **Yellow flags**: 3 occurrences per week

**Example output:**
```
⚠️ Limping logged 4x this week (up from 1x last week)
Change: +300% from last week
```

### 3. Upgrade Prompt Component (`components/upgrade/tier-gate-prompt.tsx`)
Reusable component for showing tier restrictions:

**Gate types:**
- `second-pet` - When trying to add 2nd dog
- `old-history` - When viewing data >30 days old
- `health-alerts` - When health score alerts are detected
- `pattern-detection` - When behavior patterns change
- `vet-report` - When trying to download PDF
- `medication-tracking` - When accessing med features

Each type has:
- Custom icon
- Contextual title and description
- CTA button ($9/mo)
- Secondary yearly option (45% off)

### 4. Pattern Alerts Card (`components/dashboard/pattern-alerts-card.tsx`)
Dashboard component showing pattern detection:

**For Premium users:**
- Shows full alert details with severity colors
- Displays change percentages
- Links to triage tool

**For Free users:**
- Shows blurred preview of alerts
- Displays tier gate prompt
- Creates FOMO ("Pattern Detected - Upgrade to see details")

### 5. Dashboard Integration (`app/(app)/dashboard/page.tsx`)
Updated to calculate and display pattern alerts:

**Changes:**
- Calculates pattern alerts for all users
- Premium users see full details
- Free users see gated preview
- Positioned after Health Score Panel

---

## Existing Tier Restrictions (Already Implemented)

### ✅ 1 Dog Limit for Free Tier
**Location:** `app/api/pets/route.ts` (lines 32-42)

When free user tries to add 2nd pet:
```json
{ "message": "Free tier supports 1 pet profile. Upgrade for more." }
```

### ✅ 30-Day History Limit
**Location:** `components/pets/health-log-history.tsx`

- Free users see last 30 days
- Older entries are blurred with lock icon
- Shows "+X more entries locked"
- Upgrade CTA: "Unlock Full History — $9/mo"
- Tracks `HistoryGateHit` Meta Pixel event when user scrolls to locked content

### ✅ Vet Report Export Paywall
**Location:** `components/pets/vet-report-export-button.tsx`

- Free users click "Export Vet Report"
- Shows loading animation (1.2s)
- Then displays paywall modal
- Tracks `TriedVetExport` Meta Pixel event

---

## User Experience Flow

### Free User Journey:
1. **Signup** → Can add 1 dog
2. **Tracking** → Sees last 30 days of data
3. **Dashboard** → Sees health score but pattern alerts are blurred
4. **Scroll down** → "⚠️ Pattern Detected - Upgrade to see details"
5. **Click CTA** → `/pricing?source=pattern-detection`
6. **Try to add 2nd dog** → Error: "Free tier supports 1 pet profile"
7. **Try to export PDF** → Loading → Paywall modal

### Premium User Journey:
1. **Signup + Pay** → Unlimited dogs
2. **Tracking** → Full history forever
3. **Dashboard** → Full pattern alerts with details:
   - "⚠️ Limping logged 4x this week (up from 1x last week)"
   - "Change: +300% from last week"
4. **Export PDF** → Instant download
5. **Add multiple dogs** → No restrictions

---

## Upgrade Trigger Points

Free users see upgrade prompts when they:
1. Try to add 2nd dog → "Upgrade to Pro to track unlimited dogs"
2. Scroll to locked history → "Unlock Full History — $9/mo"
3. Have pattern detected → "Pattern Detected — Upgrade to See Details"
4. Try to export vet report → Paywall modal
5. Hit 30-day milestone → "Unlock Full Report" (existing feature)

---

## Testing Checklist

### Free Tier Restrictions:
- [ ] Can only add 1 dog (error on 2nd attempt)
- [ ] Health history shows only last 30 days
- [ ] Older entries are blurred with lock icon
- [ ] Pattern alerts show blurred preview
- [ ] Vet report export triggers paywall
- [ ] Health score dashboard is read-only (no alerts)

### Premium Tier Features:
- [ ] Can add unlimited dogs
- [ ] Full health history (no 30-day limit)
- [ ] Pattern alerts show full details
- [ ] Vet report exports immediately
- [ ] Health score alerts work
- [ ] Medication tracking accessible

### Upgrade CTAs:
- [ ] All upgrade buttons link to `/pricing?source=<gate-type>`
- [ ] Yearly option shows "Save 45%"
- [ ] Meta Pixel events fire correctly:
  - `HistoryGateHit` (when scrolling to locked history)
  - `TriedVetExport` (when clicking export button)

---

## Database Schema

**No changes required.** Current schema already supports:
- `User.subscriptionStatus` = `"free"` or `"premium"`
- Pet count tracking via `pets` relation
- Health log history via `healthLogs` relation

---

## Deployment

Files changed:
- `lib/subscription.ts` (tier logic)
- `lib/pattern-detection.ts` (new file)
- `components/upgrade/tier-gate-prompt.tsx` (new file)
- `components/dashboard/pattern-alerts-card.tsx` (new file)
- `app/(app)/dashboard/page.tsx` (pattern alert integration)

**Build status:** ✅ Successful (no TypeScript errors)

Ready to commit and deploy.

---

## Next Steps

1. **Test locally** with free and premium accounts
2. **Verify Meta Pixel events** fire for gate hits
3. **Monitor conversion rate** from free to paid
4. **A/B test** upgrade copy/messaging
5. **Consider adding** more pattern detection types (e.g., weight trends, symptom combinations)

---

## Key Metrics to Track

- **Free user engagement:**
  - % who hit 2nd dog limit
  - % who scroll to locked history
  - % who see pattern alerts
  - % who try to export vet report

- **Conversion triggers:**
  - Which gate type converts best?
  - Time between signup and upgrade
  - Average days tracked before conversion

- **Premium retention:**
  - Do pattern alerts increase engagement?
  - How often do users download vet reports?
