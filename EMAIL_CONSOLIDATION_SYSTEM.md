# EMAIL CONSOLIDATION SYSTEM

**Date:** March 4, 2026  
**Status:** Deployed  
**Migration:** `20260304200000_add_email_log`

---

## PROBLEM STATEMENT

Premium users could receive **3+ emails per week**:
- Health alert email (Monday 8am UTC)
- Email drip sequence (Monday 2pm UTC)
- Weekly check-in (Sunday 9am UTC)

**Impact:** Email fatigue → spam complaints → unsubscribes → churn

---

## SOLUTION: EMAIL THROTTLING WITH PRIORITY HIERARCHY

### Priority 1: Health Alerts (ALWAYS SEND)
- **Type:** `health-alert`
- **Frequency:** As needed (when red/yellow flags detected)
- **Throttling:** NONE (safety-critical)
- **Logic:** Always send, always log

### Priority 2: Weekly Check-Ins (CONDITIONAL)
- **Type:** `weekly-checkin`
- **Frequency:** Sunday 9am UTC
- **Throttling:** Skip if health alert sent in past 7 days
- **Logic:** User already engaged with health alerts this week

### Priority 3: Email Drip (LOWEST PRIORITY)
- **Type:** `email-drip`
- **Frequency:** Daily 2pm UTC
- **Throttling:** Skip if:
  - ANY other email sent in past 24 hours, OR
  - User completed weekly check-in form in past 7 days
- **Logic:** Don't interrupt active engagement

---

## ARCHITECTURE

### Database Schema

```prisma
model EmailLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailType String   // "health-alert" | "weekly-checkin" | "email-drip"
  sentAt    DateTime @default(now())

  @@index([userId, sentAt])
  @@index([userId, emailType, sentAt])
}
```

**Indexes:**
- `(userId, sentAt)`: Fast "any recent email?" lookups
- `(userId, emailType, sentAt)`: Fast "specific email type recently?" lookups

---

### Throttling Logic (`lib/email-throttle.ts`)

#### `canSendEmail(userId, emailType): Promise<{ canSend: boolean; reason?: string }>`

**Health Alerts:**
```typescript
if (emailType === "health-alert") {
  return { canSend: true }; // Always send
}
```

**Weekly Check-Ins:**
```typescript
if (emailType === "weekly-checkin") {
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const recentHealthAlert = await prisma.emailLog.findFirst({
    where: { userId, emailType: "health-alert", sentAt: { gte: sevenDaysAgo } }
  });
  
  if (recentHealthAlert) {
    return { canSend: false, reason: "Health alert sent X days ago" };
  }
  return { canSend: true };
}
```

**Email Drip:**
```typescript
if (emailType === "email-drip") {
  // Check for any email in past 24 hours
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
  const recentEmail = await prisma.emailLog.findFirst({
    where: {
      userId,
      emailType: { in: ["health-alert", "weekly-checkin"] },
      sentAt: { gte: twentyFourHoursAgo }
    }
  });
  
  if (recentEmail) {
    return { canSend: false, reason: `${emailType} sent Xh ago` };
  }
  
  // Check if user completed weekly check-in in past 7 days
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const recentCheckIn = await prisma.weeklyCheckIn.findFirst({
    where: { userId, createdAt: { gte: sevenDaysAgo } }
  });
  
  if (recentCheckIn) {
    return { canSend: false, reason: "User completed check-in X days ago" };
  }
  
  return { canSend: true };
}
```

#### `logEmailSent(userId, emailType): Promise<void>`

```typescript
await prisma.emailLog.create({
  data: { userId, emailType }
});
```

#### `getRecentEmailLogs(userId, days = 7)`

Debug helper to see recent email history for a user.

---

## CRON INTEGRATION

### `/api/cron/health-alerts` (8am UTC daily)

```typescript
import { logEmailSent } from "@/lib/email-throttle";

// After successful email send:
await logEmailSent(user.id, "health-alert");
```

**No throttling check** - health alerts always send.

---

### `/api/cron/weekly-checkin` (9am UTC Sunday)

```typescript
import { canSendEmail, logEmailSent } from "@/lib/email-throttle";

// Before sending:
const throttleCheck = await canSendEmail(user.id, "weekly-checkin");
if (!throttleCheck.canSend) {
  console.log(`Skipping ${user.email}: ${throttleCheck.reason}`);
  skipped++;
  continue;
}

// After successful send:
await logEmailSent(user.id, "weekly-checkin");
```

**Counters:**
- `emailsSent`: Successfully sent
- `skipped`: Throttled due to recent health alert
- `errors`: Resend failures

---

### `/api/cron/email-drip` (2pm UTC daily)

```typescript
import { canSendEmail, logEmailSent } from "@/lib/email-throttle";

// Before sending:
const throttleCheck = await canSendEmail(user.id, "email-drip");
if (!throttleCheck.canSend) {
  console.log(`Skipping ${user.email} step ${step}: ${throttleCheck.reason}`);
  deferred++;
  continue;
}

// After successful send:
await logEmailSent(user.id, "email-drip");
```

**Counters:**
- `sent`: Successfully sent
- `deferred`: Throttled (24h rule or weekly check-in completed)
- `skipped`: Step criteria not met (e.g., not enough tracking days)
- `failed`: Resend failures

---

## EXAMPLE SCENARIOS

### Scenario 1: User Gets Health Alert

**Monday 8am:**
- Health alert detected (red flag: vomiting 6x)
- Email sent ✅
- Logged: `{ userId: "abc", emailType: "health-alert", sentAt: "2026-03-04 08:00" }`

**Monday 2pm:**
- Email drip tries to send Day 3 email
- `canSendEmail("abc", "email-drip")` checks:
  - Health alert sent 6 hours ago (< 24h)
  - Returns `{ canSend: false, reason: "health-alert sent 6h ago" }`
- Email drip: **SKIPPED** ❌ (deferred)

**Sunday 9am:**
- Weekly check-in tries to send
- `canSendEmail("abc", "weekly-checkin")` checks:
  - Health alert sent 6 days ago (< 7d)
  - Returns `{ canSend: false, reason: "Health alert sent 6 days ago" }`
- Weekly check-in: **SKIPPED** ❌

**Result:** User gets **1 email/week** (health alert only)

---

### Scenario 2: User Completes Weekly Check-In

**Sunday 9am:**
- Weekly check-in email sent ✅
- Logged: `{ userId: "xyz", emailType: "weekly-checkin", sentAt: "2026-03-09 09:00" }`

**Monday 2pm:**
- Email drip tries to send Day 5 email
- `canSendEmail("xyz", "email-drip")` checks:
  - Weekly check-in sent 29 hours ago (> 24h) → Pass
  - User completed check-in form Sunday (< 7d) → **FAIL**
  - Returns `{ canSend: false, reason: "User completed check-in 1 days ago" }`
- Email drip: **SKIPPED** ❌ (deferred)

**Result:** User gets **1 email/week** (weekly check-in only, drip paused)

---

### Scenario 3: No Activity, No Alerts

**Monday 2pm:**
- Email drip tries to send Day 1 email
- `canSendEmail("def", "email-drip")` checks:
  - No emails in past 24h → Pass
  - No check-ins in past 7d → Pass
  - Returns `{ canSend: true }`
- Email drip: **SENT** ✅
- Logged: `{ userId: "def", emailType: "email-drip", sentAt: "2026-03-04 14:00" }`

**Sunday 9am:**
- Weekly check-in tries to send
- `canSendEmail("def", "weekly-checkin")` checks:
  - No health alerts in past 7d → Pass
  - Returns `{ canSend: true }`
- Weekly check-in: **SENT** ✅

**Result:** User gets **2 emails/week** max (drip + weekly check-in, separated by days)

---

## PERFORMANCE

### Database Queries per Email Send

**Health Alert:** 1 query (log only)
```sql
INSERT INTO "EmailLog" (userId, emailType) VALUES (?, 'health-alert');
```

**Weekly Check-In:** 3 queries (check + log)
```sql
-- Check throttling
SELECT * FROM "EmailLog" 
WHERE userId = ? AND emailType = 'health-alert' AND sentAt >= ?
LIMIT 1;

-- Send email...

-- Log send
INSERT INTO "EmailLog" (userId, emailType) VALUES (?, 'weekly-checkin');
```

**Email Drip:** 4 queries (check + log)
```sql
-- Check for recent emails (24h)
SELECT * FROM "EmailLog"
WHERE userId = ? AND emailType IN ('health-alert', 'weekly-checkin') AND sentAt >= ?
LIMIT 1;

-- Check for completed check-in (7d)
SELECT * FROM "WeeklyCheckIn"
WHERE userId = ? AND createdAt >= ?
LIMIT 1;

-- Send email...

-- Log send
INSERT INTO "EmailLog" (userId, emailType) VALUES (?, 'email-drip');
```

**Indexes ensure all queries are fast (<5ms).**

---

## MONITORING

### Check Email Throttling for a User

```typescript
import { getRecentEmailLogs } from "@/lib/email-throttle";

const logs = await getRecentEmailLogs("user_123", 7);
console.log(logs);
// [
//   { emailType: "health-alert", sentAt: "2026-03-04 08:00" },
//   { emailType: "weekly-checkin", sentAt: "2026-03-09 09:00" }
// ]
```

### Cron Job Logs

**Health Alerts:**
```
[Health Alerts] Sent alert to user@example.com for Luna
```

**Weekly Check-In:**
```
[Weekly Check-In] Skipping user@example.com: Health alert sent 3 days ago
[Weekly Check-In] Completed: 10 sent, 5 skipped, 0 errors
```

**Email Drip:**
```
[email-drip] Skipping user@example.com step 3: health-alert sent 6h ago
[email-drip] Skipping user@example.com step 5: User completed check-in 2 days ago
```

---

## TESTING

### Manual Test: Health Alert Blocks Other Emails

1. Trigger health alert for test user (log vomiting 6x)
2. Wait for 8am UTC cron (or manually trigger)
3. Check EmailLog: `SELECT * FROM "EmailLog" WHERE userId = 'test_user'`
4. Manually trigger email-drip cron same day
5. Verify drip email is deferred (not sent)
6. Check logs: `Skipping test@example.com: health-alert sent Xh ago`

### Manual Test: Weekly Check-In Blocks Drip

1. Send weekly check-in to test user
2. User completes check-in form
3. Manually trigger email-drip cron next day
4. Verify drip email is deferred (not sent)
5. Check logs: `Skipping test@example.com: User completed check-in X days ago`

### Production Monitoring (Week 1)

- [ ] Check EmailLog table growth (should be ~100 rows/week for 100 active users)
- [ ] Monitor "skipped" counters in weekly check-in cron
- [ ] Monitor "deferred" counters in email drip cron
- [ ] Verify unsubscribe rate doesn't increase (baseline: <1%)

---

## EDGE CASES

### User Gets Multiple Pets with Alerts

**Scenario:** User has 2 dogs, both trigger health alerts same day.

**Result:** 2 health alert emails sent (both safety-critical).  
**EmailLog:** 2 entries with `emailType: "health-alert"`.  
**Drip/Check-in:** Both blocked for 24h/7d respectively.

**Could improve:** Consolidate multiple pet alerts into 1 email.

---

### User Disables Email Preferences

**Scenario:** User turns off `emailPreferences.healthAlerts = false`.

**Result:**
- Health alert cron skips them (filtering at query level)
- No EmailLog entry created (email not sent)
- Weekly check-in and drip still throttled by 7-day check-in completion

**No issue.**

---

### Cron Jobs Run at Same Time

**Scenario:** Health alert cron (8am) and email drip cron (2pm) overlap due to timezone issues.

**Result:**
- Health alert sends first (no throttling)
- EmailLog created with `sentAt: 08:00`
- Email drip checks `sentAt >= (now - 24h)`
- If now = 14:00, threshold = 14:00 - 24h = previous day 14:00
- Health alert at 08:00 is within window → drip blocked

**Works correctly.**

---

## FUTURE IMPROVEMENTS

1. **Consolidate multi-pet alerts into 1 email**
   - Current: 2 dogs with alerts = 2 emails
   - Future: 1 email with "Luna and Max both have alerts"

2. **User-configurable email frequency**
   - Add `emailPreferences.maxEmailsPerWeek: number`
   - Default: unlimited (current behavior)
   - Option: 1/week (only most urgent)

3. **Smart drip pause**
   - Current: Drip deferred if any engagement
   - Future: Drip paused for 30 days after premium upgrade

4. **Email digest mode**
   - Option: "Send me 1 weekly digest instead of individual emails"
   - Combine health alerts + check-in reminder into 1 Sunday email

---

**End of Documentation**
