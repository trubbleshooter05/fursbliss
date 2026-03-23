/**
 * One-time email to existing users: health insights launch.
 *
 *   npx tsx scripts/send-health-insights-launch-email.ts           # dry-run (list only)
 *   npx tsx scripts/send-health-insights-launch-email.ts --send    # send for real
 *   npx tsx scripts/send-health-insights-launch-email.ts --send --limit 5
 */
import "./load-env";
import { prisma } from "../lib/prisma";
import { sendHealthInsightsLaunchEmail } from "../lib/email";

const SEND = process.argv.includes("--send");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1]!, 10) : undefined;

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: { not: "" },
      pets: { some: { isActive: true } },
    },
    select: {
      id: true,
      email: true,
      pets: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "asc" },
    ...(limit != null && Number.isFinite(limit) ? { take: limit } : {}),
  });

  const recipients = users.filter((u) => u.pets[0]);

  console.log(
    `[health-insights-email] ${SEND ? "SEND" : "DRY-RUN"} — ${recipients.length} recipient(s)${
      limit != null ? ` (limit ${limit})` : ""
    }`
  );

  if (!SEND) {
    for (const u of recipients.slice(0, 15)) {
      const p = u.pets[0]!;
      console.log(`  - ${u.email} → ${p.name} (${p.id})`);
    }
    if (recipients.length > 15) console.log(`  ... and ${recipients.length - 15} more`);
    console.log("\nRe-run with --send to actually send (requires RESEND_API_KEY, NEXT_PUBLIC_APP_URL).");
    return;
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    console.error(
      "\nMissing RESEND_API_KEY in this shell’s environment.\n" +
        "Copy it from Vercel → Project → Settings → Environment Variables → Production,\n" +
        "add to .env.local as: RESEND_API_KEY=re_...\n" +
        "Then run: npm run email:health-insights-launch -- --send\n"
    );
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;
  let skipped = 0;
  for (const u of recipients) {
    const pet = u.pets[0]!;
    const idempotencyKey = `health-insights-launch-2026-03:${u.id}`;
    try {
      const result = await sendHealthInsightsLaunchEmail(u.email, pet.name, pet.id, { idempotencyKey });
      if (result.queued) {
        ok++;
        console.log(`  sent → ${u.email}`);
      } else {
        skipped++;
        console.warn(`  skipped (Resend returned not queued) → ${u.email}`);
      }
    } catch (e) {
      fail++;
      console.error(`  FAIL → ${u.email}`, e);
    }
  }

  console.log(`\nDone: ${ok} sent, ${skipped} skipped, ${fail} failed`);
  if (skipped > 0 && ok === 0) {
    console.error("\nNo emails were actually delivered. Fix RESEND_API_KEY / Resend config and try again.");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
