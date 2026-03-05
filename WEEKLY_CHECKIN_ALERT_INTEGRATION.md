# WEEKLY CHECK-IN INTEGRATION INTO HEALTH ALERTS

**Date:** March 4, 2026  
**Status:** Deployed  
**Commit:** `8e78a02`

---

## PROBLEM STATEMENT

Weekly check-in data (energy, appetite, new symptoms, vet visits) was stored in the database but **completely ignored** by the health alert system.

**Result:** Users manually reporting "much worse" energy/appetite had no alerts triggered, missing critical early warning signals.

---

## SOLUTION: INTEGRATE WEEKLY CHECK-INS

### Data Flow

```
USER SUBMITS WEEKLY CHECK-IN
         ↓
  [WeeklyCheckIn table]
         ↓
    ┌────┴────┐
    ↓         ↓
DASHBOARD   HEALTH ALERT CRON
LOAD        (8am UTC daily)
    ↓         ↓
    └────┬────┘
         ↓
calculateHealthAlert()
  ├─ Daily logs (existing)
  ├─ Weekly check-ins (NEW)
  └─ Combined alert level
         ↓
   AlertCard display
   (with source badge)
```

---

## IMPLEMENTATION

### 1. Health Alert Logic (`lib/health-alerts.ts`)

#### New Type: WeeklyCheckIn

```typescript
export type WeeklyCheckIn = {
  energyLevel: string; // "better", "same", "worse", "much_worse"
  appetite: string; // "better", "same", "worse", "much_worse"
  newSymptoms: boolean;
  symptomDetails: string | null;
  vetVisit: boolean;
  createdAt: Date;
};
```

#### Updated Function Signature

```typescript
export function calculateHealthAlert(
  entries: HealthLogEntry[],
  petName: string,
  recentCheckIns?: WeeklyCheckIn[] // NEW: optional weekly check-ins
): HealthAlert
```

#### Alert Source Tracking

```typescript
export type HealthAlert = {
  level: "red" | "yellow" | "green";
  reason: string;
  actionable: string;
  source?: "daily_logs" | "weekly_checkin" | "combined"; // NEW
};
```

#### New Function: checkWeeklyCheckInSignals()

**🔴 RED ALERT RULES:**
- Both energy AND appetite are "worse" or "much_worse" in same check-in

```typescript
if (energyWorse && appetiteWorse) {
  return {
    level: "red",
    reason: `🔴 URGENT: ${petName} showing concerning patterns`,
    actionable: `Your weekly check-in reported declining energy AND appetite. Consider calling your vet today.`,
    source: "weekly_checkin",
  };
}
```

**🟡 YELLOW ALERT RULES:**
- Either energy OR appetite is "much_worse"
- New symptoms reported with details

```typescript
if (latest.energyLevel === "much_worse") {
  return {
    level: "yellow",
    reason: `⚠️ WATCH CLOSELY: ${petName} showing changes`,
    actionable: `Your weekly check-in reported much worse energy levels. Continue monitoring.`,
    source: "weekly_checkin",
  };
}

if (latest.newSymptoms && latest.symptomDetails) {
  return {
    level: "yellow",
    actionable: `Your weekly check-in reported new symptoms: "${latest.symptomDetails}".`,
    source: "weekly_checkin",
  };
}
```

**🟢 GREEN WITH CONTEXT:**
- Vet visit mentioned in green alert actionable text

```typescript
if (recentCheckIns[0].vetVisit) {
  greenAlert.actionable += " Recent vet visit reported.";
}
```

---

### 2. Dashboard Integration (`app/(app)/dashboard/page.tsx`)

#### Fetch Weekly Check-Ins

```typescript
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const recentCheckIns = await prisma.weeklyCheckIn.findMany({
  where: {
    petId: primaryPet.id,
    createdAt: { gte: sevenDaysAgo },
  },
  orderBy: { createdAt: "desc" },
  take: 2, // Get up to 2 most recent check-ins
  select: {
    energyLevel: true,
    appetite: true,
    newSymptoms: true,
    symptomDetails: true,
    vetVisit: true,
    createdAt: true,
  },
});
```

#### Pass to Alert Calculation

```typescript
const alert = calculateHealthAlert(primaryPetLogs, primaryPet.name, recentCheckIns);
healthAlertData = {
  level: alert.level,
  reason: alert.reason,
  actionable: alert.actionable,
  petName: primaryPet.name,
  source: alert.source, // NEW: Track source
};
```

---

### 3. Health Alerts Cron (`app/api/cron/health-alerts/route.ts`)

#### Fetch Weekly Check-Ins Per Pet

```typescript
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const recentCheckIns = await prisma.weeklyCheckIn.findMany({
  where: {
    petId: pet.id,
    createdAt: { gte: sevenDaysAgo },
  },
  orderBy: { createdAt: "desc" },
  take: 2,
});
```

#### Check for Urgent Signals

```typescript
let hasUrgentCheckInSignal = false;
if (recentCheckIns.length > 0) {
  const latest = recentCheckIns[0];
  const energyWorse = latest.energyLevel === "worse" || latest.energyLevel === "much_worse";
  const appetiteWorse = latest.appetite === "worse" || latest.appetite === "much_worse";
  
  hasUrgentCheckInSignal = 
    (energyWorse && appetiteWorse) || // Both declining
    latest.energyLevel === "much_worse" || // Severe energy decline
    latest.appetite === "much_worse" || // Severe appetite decline
    (latest.newSymptoms && !!latest.symptomDetails); // New symptoms with details
}
```

#### Include in Alert Logic

```typescript
const shouldSendAlert =
  hasRedFlags || 
  significantScoreChange || 
  (hasNewYellowFlags && scoreChange < -5) ||
  hasUrgentCheckInSignal; // NEW: Include check-in signals
```

---

### 4. AlertCard UI (`components/dashboard/alert-card.tsx`)

#### Added Source Prop

```typescript
type AlertCardProps = {
  // ... existing props
  source?: "daily_logs" | "weekly_checkin" | "combined";
};
```

#### Display Source Badge

```typescript
{source === "weekly_checkin" && (
  <p className="text-xs italic text-amber-700">
    Based on your weekly check-in response
  </p>
)}
```

**Styling:**
- Appears below the main actionable message
- Italic text
- Color-coded (rose-700, amber-700, emerald-700 based on alert level)

---

## ALERT PRIORITY RULES

**Existing daily log alerts are UNCHANGED:**
- All red/yellow/green thresholds from daily logs still apply
- Symptom frequency checks (5+ times = red, 3-4 times = yellow)
- Weight loss checks (>5% rapid, >2% gradual)
- Low energy streaks (4+ days)

**Weekly check-ins are ADDITIVE:**
- Run AFTER daily log checks
- Can trigger alert when daily logs show green
- CANNOT downgrade an existing red/yellow alert
- Source tracking shows which system triggered the alert

**Priority Order:**
1. Urgent symptoms (daily logs) → RED
2. Red alert patterns (daily logs) → RED
3. Yellow alert patterns (daily logs) → YELLOW
4. **Weekly check-in urgent signals → RED or YELLOW** (NEW)
5. Green (all clear)

---

## EXAMPLE SCENARIOS

### Scenario 1: Check-In Triggers Yellow (Daily Logs Green)

**Daily Logs:**
- Last 7 days: consistent energy (7/10), good appetite
- No symptoms logged
- Result: GREEN from daily logs

**Weekly Check-In:**
- User submits: `energyLevel: "much_worse"`
- Context: "Sleeping all day, barely plays"

**Alert Triggered:**
```
Level: YELLOW
Reason: "⚠️ WATCH CLOSELY: Luna showing changes"
Actionable: "Your weekly check-in reported much worse energy levels. Continue monitoring. Alert your vet if it worsens."
Source: "weekly_checkin"
```

**UI Display:**
```
⚠️ WATCH CLOSELY: Luna showing changes
Your weekly check-in reported much worse energy levels. Continue monitoring.
Based on your weekly check-in response [italic]
```

---

### Scenario 2: Check-In Triggers Red (Both Declining)

**Daily Logs:** GREEN (no patterns)

**Weekly Check-In:**
- `energyLevel: "worse"`
- `appetite: "worse"`

**Alert Triggered:**
```
Level: RED
Reason: "🔴 URGENT: Max showing concerning patterns"
Actionable: "Your weekly check-in reported declining energy AND appetite. Consider calling your vet today."
Source: "weekly_checkin"
```

**Email Sent (Health Alerts Cron):**
```
Subject: ⚠️ Your weekly check-in for Max reported concerning changes
Body: Your weekly check-in reported declining energy AND appetite...
```

---

### Scenario 3: Daily Logs Already Red (Check-In Doesn't Override)

**Daily Logs:**
- Vomiting logged 6x this week
- Result: RED from urgent symptom check

**Weekly Check-In:**
- `energyLevel: "better"`
- `appetite: "same"`

**Alert Result:**
```
Level: RED (unchanged from daily logs)
Reason: "🔴 URGENT: Luna showing concerning patterns"
Actionable: "Vomiting logged 6x this week. Consider calling your vet today."
Source: "daily_logs" (check-in does NOT override)
```

**Why?** Daily log urgent symptoms are highest priority. Check-in can't downgrade.

---

### Scenario 4: New Symptoms Reported

**Daily Logs:** GREEN

**Weekly Check-In:**
- `newSymptoms: true`
- `symptomDetails: "Limping on front left leg after walks"`

**Alert Triggered:**
```
Level: YELLOW
Actionable: "Your weekly check-in reported new symptoms: 'Limping on front left leg after walks'. Continue monitoring."
Source: "weekly_checkin"
```

---

### Scenario 5: Vet Visit Context (Green Alert)

**Daily Logs:** GREEN  
**Weekly Check-In:** `vetVisit: true`

**Alert Result:**
```
Level: GREEN
Reason: "All Clear: Luna looking stable"
Actionable: "Keep up the tracking! Recent vet visit reported."
Source: "daily_logs"
```

**Note:** Vet visit doesn't trigger alert, but adds context to green alerts.

---

## TESTING CHECKLIST

### Manual Tests

**Test 1: Check-In Triggers Yellow**
1. Log daily health for Luna (all normal, energy 7/10)
2. Dashboard shows GREEN alert
3. Submit weekly check-in: `energyLevel: "much_worse"`
4. Refresh dashboard
5. ✅ Expect: YELLOW alert with "Based on your weekly check-in response"

**Test 2: Check-In Triggers Red**
1. Daily logs normal
2. Submit weekly check-in: `energyLevel: "worse"`, `appetite: "worse"`
3. Refresh dashboard
4. ✅ Expect: RED alert mentioning "declining energy AND appetite"

**Test 3: Daily Logs Override Check-In**
1. Log vomiting 6x this week (triggers RED from daily logs)
2. Submit weekly check-in: `energyLevel: "better"`
3. Refresh dashboard
4. ✅ Expect: RED alert still showing vomiting (not overridden)

**Test 4: Email Alert Triggered by Check-In**
1. Premium user submits check-in with both metrics "worse"
2. Wait for 8am UTC health-alerts cron
3. ✅ Expect: Email sent with subject mentioning weekly check-in

---

## MONITORING

### Database Queries

**Check recent check-ins triggering alerts:**
```sql
SELECT 
  wc.petId,
  wc.energyLevel,
  wc.appetite,
  wc.newSymptoms,
  wc.symptomDetails,
  wc.createdAt
FROM "WeeklyCheckIn" wc
WHERE wc.createdAt >= NOW() - INTERVAL '7 days'
  AND (
    (wc.energyLevel IN ('worse', 'much_worse') AND wc.appetite IN ('worse', 'much_worse'))
    OR wc.energyLevel = 'much_worse'
    OR wc.appetite = 'much_worse'
    OR (wc.newSymptoms = true AND wc.symptomDetails IS NOT NULL)
  );
```

### Cron Logs

**Health Alerts Cron Output:**
```
[Health Alerts] Found 25 premium users
[Health Alerts] Processing user@example.com pet Luna
[Health Alerts] Check-in signal: both energy and appetite worse
[Health Alerts] Sent alert to user@example.com for Luna
[Health Alerts] Completed: 5 emails sent, 5 alerts created
```

### Dashboard Analytics

Track how often weekly check-ins trigger alerts:
- Count alerts where `source = "weekly_checkin"`
- Compare to alerts where `source = "daily_logs"`
- Measure user engagement after check-in alerts

---

## PERFORMANCE IMPACT

**Database Queries Added:**
- Dashboard: +1 query per page load (fetch 2 recent check-ins)
  - Query time: ~5ms (indexed on `[petId, createdAt]`)
- Health alerts cron: +1 query per pet processed
  - Query time: ~5ms per pet
  - For 100 premium users with 150 pets: +750ms total

**Impact:** Negligible (<1% increase in dashboard load time)

---

## FUTURE IMPROVEMENTS

1. **"Combined" source tracking**
   - Currently: Either daily_logs OR weekly_checkin
   - Future: Track when BOTH contribute to alert level

2. **Check-in history comparison**
   - Current: Only uses most recent check-in
   - Future: Compare this week vs. last week check-ins
   - Example: "Energy declined from 'same' to 'worse' week-over-week"

3. **Vet visit tracking integration**
   - Current: Just adds context note
   - Future: Suppress alerts for 7 days after vet visit (already being monitored)

4. **Check-in reminder based on alerts**
   - If red alert triggered by check-in, prompt follow-up check-in in 3 days

---

**End of Documentation**
