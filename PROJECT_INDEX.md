# Fursbliss Project Index

## File Tree
.env.example
.gitignore
README.md
app/(app)/account/page.tsx
app/(app)/admin/page.tsx
app/(app)/dashboard/page.tsx
app/(app)/insights/page.tsx
app/(app)/layout.tsx
app/(app)/logs/new/page.tsx
app/(app)/pets/[id]/breed-risks/page.tsx
app/(app)/pets/[id]/edit/page.tsx
app/(app)/pets/[id]/gut-health/page.tsx
app/(app)/pets/[id]/interaction-check/page.tsx
app/(app)/pets/[id]/page.tsx
app/(app)/pets/[id]/photos/page.tsx
app/(app)/pets/[id]/vet-share/page.tsx
app/(app)/pets/new/page.tsx
app/(app)/pets/page.tsx
app/api/account/email-preferences/route.ts
app/api/admin/seed-demo/route.ts
app/api/ai/interaction-check/route.ts
app/api/ai/photo-analysis/route.ts
app/api/ai/recommendations/[id]/route.ts
app/api/ai/recommendations/route.ts
app/api/auth/[...nextauth]/route.ts
app/api/auth/forgot-password/route.ts
app/api/auth/register/route.ts
app/api/auth/reset-password/route.ts
app/api/cron/reminders/route.ts
app/api/doses/complete/route.ts
app/api/exports/logs/route.ts
app/api/exports/pet-report/route.ts
app/api/gut-health/route.ts
app/api/health/route.ts
app/api/logs/route.ts
app/api/pets/[id]/doses/route.ts
app/api/pets/[id]/medications/route.ts
app/api/pets/[id]/route.ts
app/api/pets/route.ts
app/api/photos/route.ts
app/api/reminders/run/route.ts
app/api/reports/share-link/route.ts
app/api/stripe/checkout/route.ts
app/api/stripe/portal/route.ts
app/api/stripe/webhook/route.ts
app/api/uploads/route.ts
app/breeds/[slug]/page.tsx
app/breeds/page.tsx
app/community/page.tsx
app/favicon.ico
app/fonts/GeistMonoVF.woff
app/fonts/GeistVF.woff
app/forgot-password/page.tsx
app/globals.css
app/invite/[code]/page.tsx
app/layout.tsx
app/login/page.tsx
app/longevity-drugs/page.tsx
app/page.tsx
app/pricing/page.tsx
app/reset-password/page.tsx
app/signup/page.tsx
app/supplements/[slug]/page.tsx
app/trends/page.tsx
app/verify-email/page.tsx
app/vet-view/[token]/page.tsx
auth.ts
components.json
components/account/email-preferences-form.tsx
components/auth/forgot-password-form.tsx
components/auth/login-form.tsx
components/auth/reset-password-form.tsx
components/auth/signup-form.tsx
components/dashboard/app-shell.tsx
components/dashboard/energy-trend-chart.tsx
components/dashboard/pet-switcher.tsx
components/dashboard/reminder-panel.tsx
components/dashboard/user-menu.tsx
components/insights/insights-panel.tsx
components/logs/health-log-form.tsx
components/pets/delete-pet-dialog.tsx
components/pets/dose-schedule-form.tsx
components/pets/medication-form.tsx
components/pets/pet-form.tsx
components/pets/photo-uploader.tsx
components/pets/weight-trend-chart.tsx
components/site/site-footer.tsx
components/site/site-header.tsx
components/ui/alert.tsx
components/ui/badge.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/checkbox.tsx
components/ui/dialog.tsx
components/ui/dropdown-menu.tsx
components/ui/form.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/popover.tsx
components/ui/select.tsx
components/ui/sheet.tsx
components/ui/skeleton.tsx
components/ui/table.tsx
components/ui/tabs.tsx
components/ui/textarea.tsx
components/ui/toast.tsx
components/ui/toaster.tsx
components/ui/tooltip.tsx
dev.db
hooks/use-toast.ts
lib/auth-tokens.ts
lib/breed-pages.ts
lib/crop-image.ts
lib/email-preferences.ts
lib/email.ts
lib/prisma.ts
lib/rate-limit.ts
lib/stripe.ts
lib/subscription.ts
lib/utils.ts
middleware.ts
next.config.mjs
package-lock.json
package.json
postcss.config.mjs
prisma.config.ts
prisma/migrations/20260208165243_init/migration.sql
prisma/migrations/20260208170139_add_updatedat_defaults/migration.sql
prisma/migrations/migration_lock.toml
prisma/schema.prisma
prisma/seed.ts
tailwind.config.ts
tsconfig.json
types/email-preferences.ts
types/next-auth.d.ts

## Recent Commits
2b82c96 Sync recent features, API routes, UI, and Prisma changes
f496196 Hide upgrade card for premium users
60f0ef0 Speed up AI and relax export limits
6df2851 Use Vercel Blob for uploads
7fb6adc Add pg types for Prisma adapter
14838cc Switch Prisma to Postgres
8e8bbbe Expose seed demo error details
eba1875 Run seed demo in node runtime
a1dfe5c Add demo account seed endpoint
c3fa79f Fix pricing subscribe button
e542dfe Harden API routes and add health check
afcb905 Run prisma generate on install.
d63267e Fix type errors for production build.
2def29f Type dashboard reduce accumulator.
b2e229b Type admin pet/log rows.

## TODO / FIXME
./package-lock.json:4618:      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
