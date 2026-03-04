import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { writeFileSync } from "fs";

// Load production environment variables
config({ path: resolve(process.cwd(), ".env.production") });

console.log("🔧 Loaded .env.production");

// Use production DATABASE_URL from environment (same setup as lib/prisma.ts)
const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  ),
  log: ["error"],
});

async function exportProductionUsers() {
  console.log("Connecting to PRODUCTION database...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL?.slice(0, 50) + "...");

  console.log("\nFetching ALL registered users...");

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      pets: {
        select: {
          name: true,
          breed: true,
          age: true,
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n📊 Total users in database: ${allUsers.length}`);

  // Separate paid and unpaid
  const unpaidUsers = allUsers.filter((u) => !u.stripeCustomerId);
  const paidUsers = allUsers.filter((u) => u.stripeCustomerId);

  console.log(`💰 Paid users: ${paidUsers.length}`);
  console.log(`📧 Unpaid users: ${unpaidUsers.length}`);

  // Filter for recent unpaid users (since Feb 8, 2026)
  const recentUnpaid = unpaidUsers.filter(
    (u) => u.createdAt >= new Date("2026-02-08T00:00:00Z")
  );
  console.log(`🆕 Recent unpaid (since Feb 8): ${recentUnpaid.length}`);

  // Create email list for outreach
  const emailList = unpaidUsers.map((u) => ({
    email: u.email,
    firstName: u.name?.split(" ")[0] || "there",
    fullName: u.name || "User",
    dogName: u.pets[0]?.name || "your dog",
    dogBreed: u.pets[0]?.breed || "",
    dogAge: u.pets[0]?.age || null,
    registeredDate: u.createdAt.toISOString().split("T")[0],
    hasPet: u.pets.length > 0,
  }));

  // Write JSON
  writeFileSync(
    "production-users.json",
    JSON.stringify(emailList, null, 2)
  );
  console.log("\n✅ Exported to: production-users.json");

  // Write CSV
  const csv = [
    "email,firstName,fullName,dogName,dogBreed,dogAge,registeredDate,hasPet",
    ...emailList.map((u) =>
      [
        u.email,
        u.firstName,
        u.fullName,
        u.dogName,
        u.dogBreed,
        u.dogAge || "",
        u.registeredDate,
        u.hasPet,
      ].join(",")
    ),
  ].join("\n");

  writeFileSync("production-users.csv", csv);
  console.log("✅ Exported to: production-users.csv");

  console.log("\n📋 Summary:");
  console.log(`Total users: ${allUsers.length}`);
  console.log(`Paid users: ${paidUsers.length}`);
  console.log(`Unpaid users: ${unpaidUsers.length}`);
  console.log(`Recent unpaid (Feb 8+): ${recentUnpaid.length}`);
  console.log(`Users with pets: ${emailList.filter((u) => u.hasPet).length}`);

  // Show first 5 emails as preview
  console.log("\n👀 Preview (first 5 unpaid users):");
  emailList.slice(0, 5).forEach((u) => {
    console.log(`- ${u.email} (${u.firstName}) - ${u.dogName} (${u.registeredDate})`);
  });

  await prisma.$disconnect();
}

exportProductionUsers().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
