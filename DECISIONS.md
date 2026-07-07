# FursBliss — Architecture Decisions

## 5-Email Nurture Drip (July 2026)

### Infrastructure (already existed)
- Resend via `lib/email.ts` (`RESEND_API_KEY`)
- Prisma `EmailSequenceEnrollment` + `EmailSequenceStep` tables (equivalent to requested `email_sequences`)
- `enrollUserInWelcomeSequence()` called on free signup in `app/api/auth/register/route.ts`
- Cron sender: `app/api/cron/email-drip/route.ts` (Vercel cron, `CRON_SECRET`)

### What changed
- Schedule updated to days **0, 2, 4, 7, 10** in `lib/email/sequence.ts`
- Email copy rewritten per Greg's Luna/nurture sequence (5 emails, 150–200 words)
- Day 4 CTA → Urgent Answer checkout (`product=urgent`)
- Day 10 CTA → annual Premium checkout (`plan=yearly`, $79/year positioning)
- Premium users skip remaining emails at day 10

### Duplicate-send prevention
Existing `emailSequenceStep` status + idempotency keys in cron — unchanged.

## Symptom Severity Upsell (July 2026)

- `lib/symptom-severity.ts` — maps mild/moderate/severe + red flags to 0–10 score
- `components/site/symptom-urgent-upsell.tsx` — custom copy + "Unlock Urgent Answer" CTA
- `components/emergency-symptoms/emergency-checker.tsx` — shows upsell when score ≥ 6; generic CTA when lower
- Checkout upsell on `/pricing` unchanged

## Affiliate Integration (July 2026)

- `lib/affiliate-links.ts` — Trupanion, Pawp, Amazon search URLs (uses `NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG` if set)
- `components/site/affiliate-links.tsx` — `AffiliateNextSteps` + `SymptomAffiliatePicks`
- Urgent-answer results (`er-triage-workbench.tsx` when `result.detailed`) → Trupanion + Pawp
- Symptom checker results → Amazon senior dog product links

### Env vars
| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Email sending (already configured) |
| `CRON_SECRET` | Protect email-drip cron |
| `STRIPE_PRICE_ID_URGENT_ANSWER` | Urgent Answer checkout (set to `price_1TnhgN0d0P07z4ppse8DwHME`) |
| `NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG` | Optional Amazon Associates tag |
