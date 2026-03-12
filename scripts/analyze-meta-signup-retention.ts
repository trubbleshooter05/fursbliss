/**
 * Analyze: "Of the N people who signed up from Meta ads, how many logged health
 * data more than once?"
 *
 * NOTE: Your DB doesn't store signup source (Meta vs organic). Use --since with
 * the date your Meta ads started as a proxy. Or get the 14 emails from Meta Ads
 * Manager (Events Manager → Data Sources → your Pixel → Events → CompleteRegistration
 * → View details; or export from Ads Reporting) and use --emails.
 *
 * For production DB: npx tsx scripts/... --production --since 2026-02-28
 *
 * USAGE:
 *   # By date range (proxy for Meta ads - use when your ads ran)
 *   npx tsx scripts/analyze-meta-signup-retention.ts --since 2026-02-28
 *
 *   # By specific emails (if you have the list from Meta Ads Manager)
 *   npx tsx scripts/analyze-meta-signup-retention.ts --emails "a@x.com,b@y.com"
 *
 *   # Both: date range + optional email filter
 *   npx tsx scripts/analyze-meta-signup-retention.ts --since 2026-02-28 --until 2026-03-15
 *
 * "Health data" = HealthLog + WeeklyCheckIn + GutHealthLog
 */

import { config } from "dotenv";
import { resolve } from "path";
import { prisma } from "../lib/prisma";

// Load .env.production if --production flag
if (process.argv.includes("--production")) {
  config({ path: resolve(process.cwd(), ".env.production") });
} else {
  config();
}

function parseArgs(): { since?: Date; until?: Date; emails?: string[] } {
  const args = process.argv.slice(2).filter((a) => a !== "--production");
  const result: { since?: Date; until?: Date; emails?: string[] } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--since" && args[i + 1]) {
      result.since = new Date(args[++i]);
    } else if (args[i] === "--until" && args[i + 1]) {
      result.until = new Date(args[++i]);
    } else if (args[i] === "--emails" && args[i + 1]) {
      result.emails = args[++i]
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    }
  }

  return result;
}

async function main() {
  const { since, until, emails } = parseArgs();

  if (!since && !emails?.length) {
    console.log(`
Usage:
  --since YYYY-MM-DD   Filter users by signup date (e.g. when Meta ads ran)
  --until YYYY-MM-DD   Optional end date
  --emails "a@x.com,b@y.com"   Specific emails (from Meta conversion report)

Example (ads ran Feb 28 - Mar 12):
  npx tsx scripts/analyze-meta-signup-retention.ts --since 2026-02-28 --until 2026-03-13
`);
    process.exit(1);
  }

  const where: { email?: { in: string[] }; createdAt?: object } = {};

  if (emails?.length) {
    where.email = { in: emails };
  }
  if (since || until) {
    where.createdAt = {};
    if (since) (where.createdAt as Record<string, Date>).gte = since;
    if (until) (where.createdAt as Record<string, Date>).lte = until;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      stripeCustomerId: true,
      pets: {
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              healthLogs: true,
              weeklyCheckIns: true,
              gutHealthLogs: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("\n" + "=".repeat(70));
  console.log("META AD SIGNUP RETENTION ANALYSIS");
  console.log("=".repeat(70));
  console.log(
    `\nCohort: ${emails?.length ? `${emails.length} emails` : "signups"}${since ? ` from ${since.toISOString().split("T")[0]}` : ""}${until ? ` to ${until.toISOString().split("T")[0]}` : ""}`
  );
  console.log(`Total users found: ${users.length}\n`);

  if (users.length === 0) {
    console.log("No users match. Check --since date or --emails list.");
    await prisma.$disconnect();
    return;
  }

  type UserRow = (typeof users)[0];
  const getHealthDataCount = (u: UserRow) =>
    u.pets.reduce(
      (sum, p) =>
        sum +
        p._count.healthLogs +
        p._count.weeklyCheckIns +
        p._count.gutHealthLogs,
      0
    );

  const loggedMoreThanOnce = users.filter((u) => getHealthDataCount(u) > 1);
  const loggedOnce = users.filter((u) => getHealthDataCount(u) === 1);
  const neverLogged = users.filter((u) => getHealthDataCount(u) === 0);

  console.log("--- SUMMARY (answer for your mentor) ---\n");
  console.log(
    `Of ${users.length} signups: ${loggedMoreThanOnce.length} logged health data MORE THAN ONCE`
  );
  console.log(`                    ${loggedOnce.length} logged exactly once`);
  console.log(`                    ${neverLogged.length} never logged\n`);

  const pctRetained =
    users.length > 0
      ? ((loggedMoreThanOnce.length / users.length) * 100).toFixed(0)
      : "0";
  console.log(
    `→ ${pctRetained}% retention (logged 2+ times) — ${Number(pctRetained) >= 70 ? "Distribution problem (find more of these people)" : "Product/retention problem (deliver value faster)"}\n`
  );

  console.log("--- PER-USER BREAKDOWN ---\n");

  users.forEach((u, i) => {
    const total = getHealthDataCount(u);
    const hl = u.pets.reduce((s, p) => s + p._count.healthLogs, 0);
    const wc = u.pets.reduce((s, p) => s + p._count.weeklyCheckIns, 0);
    const gh = u.pets.reduce((s, p) => s + p._count.gutHealthLogs, 0);
    const label =
      total > 1 ? "✓ 2+" : total === 1 ? "· 1x" : "✗ 0";
    console.log(
      `${i + 1}. ${u.email} | ${label} | logs:${hl} weekly:${wc} gut:${gh} | ${u.createdAt.toISOString().split("T")[0]}`
    );
  });

  console.log("\n--- WHY DID OTHERS STOP? ---");
  console.log(
    "Review users with 0–1 logs. Common reasons: no pet added, forgot, didn't see value, friction in flow."
  );
  console.log(
    "Consider: email the 0–1 log users and ask (short survey or reply).\n"
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
