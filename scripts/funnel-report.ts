#!/usr/bin/env tsx
/**
 * CLI funnel report for last 30 days (Prisma FunnelEvent + User/Urgent Answer).
 * Usage: npx tsx scripts/funnel-report.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function rate(n: number, d: number) {
  if (!d) return "n/a";
  return `${((n / d) * 100).toFixed(1)}%`;
}

async function main() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const home = await prisma.funnelEvent.count({
    where: { createdAt: { gte: since }, name: "page_view", path: "/" },
  });
  const pricing = await prisma.funnelEvent.count({
    where: {
      createdAt: { gte: since },
      OR: [{ name: "pricing_viewed" }, { name: "page_view", path: "/pricing" }],
    },
  });
  const signupStarts = await prisma.funnelEvent.count({
    where: { createdAt: { gte: since }, name: "signup_started" },
  });
  const checkoutStarts = await prisma.funnelEvent.count({
    where: { createdAt: { gte: since }, name: "checkout_started" },
  });
  const purchases = await prisma.funnelEvent.count({
    where: { createdAt: { gte: since }, name: "purchase" },
  });

  console.log("FursBliss funnel — last 30 days");
  console.log({ home, pricing, signupStarts, checkoutStarts, purchases });
  console.log("home→pricing", rate(pricing, home));
  console.log("pricing→checkout", rate(checkoutStarts, pricing));
  console.log("checkout→paid", rate(purchases, checkoutStarts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
