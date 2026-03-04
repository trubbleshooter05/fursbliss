import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { writeFileSync } from "fs";

config({ path: resolve(process.cwd(), ".env.production") });

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  ),
  log: ["error"],
});

async function analyzeChurnedUsers() {
  console.log("🔍 Analyzing churned paid users...\n");

  // Get ALL users with Stripe customer IDs (paid at some point)
  const allPaidUsers = await prisma.user.findMany({
    where: {
      stripeCustomerId: { not: null },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionEndsAt: true,
      pets: {
        select: {
          name: true,
          breed: true,
          age: true,
          createdAt: true,
          healthLogs: {
            select: {
              date: true,
            },
            orderBy: {
              date: "desc",
            },
            take: 1,
          },
          _count: {
            select: {
              healthLogs: true,
            },
          },
        },
      },
      _count: {
        select: {
          pets: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`📊 Total users who ever paid: ${allPaidUsers.length}\n`);

  const currentlyActive = allPaidUsers.filter((u) => u.subscriptionStatus === "premium");
  const churned = allPaidUsers.filter((u) => u.subscriptionStatus !== "premium");

  console.log(`✅ Currently active premium: ${currentlyActive.length}`);
  console.log(`❌ Churned (paid but cancelled): ${churned.length}\n`);

  if (churned.length > 0) {
    console.log("=".repeat(80));
    console.log("CHURNED USERS ANALYSIS");
    console.log("=".repeat(80) + "\n");

    churned.forEach((user, index) => {
      const daysSinceSignup = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Get latest log across all pets
      const allLogs = user.pets.flatMap((p) => p.healthLogs);
      const lastLog = allLogs.length > 0 ? allLogs[0]?.date : null;
      const daysSinceLastLog = lastLog
        ? Math.floor((Date.now() - lastLog.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      const totalLogs = user.pets.reduce((sum, p) => sum + p._count.healthLogs, 0);

      console.log(`${index + 1}. ${user.email} (${user.name || "No name"})`);
      console.log(`   Signed up: ${user.createdAt.toISOString().split("T")[0]} (${daysSinceSignup} days ago)`);
      console.log(`   Subscription: ${user.subscriptionStatus || "inactive"}`);
      console.log(`   Plan: ${user.subscriptionPlan || "none"}`);
      console.log(`   Ends at: ${user.subscriptionEndsAt?.toISOString().split("T")[0] || "N/A"}`);
      console.log(`   Pets: ${user._count.pets}`);
      console.log(`   Health logs: ${totalLogs}`);
      console.log(
        `   Last logged: ${lastLog ? `${lastLog.toISOString().split("T")[0]} (${daysSinceLastLog} days ago)` : "Never"}`
      );

      if (user.pets.length > 0) {
        user.pets.forEach((pet) => {
          console.log(`   - ${pet.name} (${pet.breed}, ${pet.age} years old) - ${pet._count.healthLogs} logs`);
        });
      }

      console.log("");
    });

    // Summary stats
    const avgLogs = churned.reduce((sum, u) => {
      const totalLogs = u.pets.reduce((psum, p) => psum + p._count.healthLogs, 0);
      return sum + totalLogs;
    }, 0) / churned.length;
    
    const usersWithZeroLogs = churned.filter((u) => {
      const totalLogs = u.pets.reduce((sum, p) => sum + p._count.healthLogs, 0);
      return totalLogs === 0;
    }).length;
    const usersWithNoPets = churned.filter((u) => u._count.pets === 0).length;

    console.log("=".repeat(80));
    console.log("CHURN INSIGHTS");
    console.log("=".repeat(80));
    console.log(`Average health logs per churned user: ${avgLogs.toFixed(1)}`);
    console.log(`Users who never logged health: ${usersWithZeroLogs} (${((usersWithZeroLogs / churned.length) * 100).toFixed(0)}%)`);
    console.log(`Users with no pets created: ${usersWithNoPets} (${((usersWithNoPets / churned.length) * 100).toFixed(0)}%)`);
    console.log("");
  }

  // Export to JSON
  const exportData = churned.map((u) => {
    const allLogs = u.pets.flatMap((p) => p.healthLogs);
    const totalLogs = u.pets.reduce((sum, p) => sum + p._count.healthLogs, 0);
    
    return {
      email: u.email,
      name: u.name,
      signupDate: u.createdAt.toISOString().split("T")[0],
      subscriptionStatus: u.subscriptionStatus,
      plan: u.subscriptionPlan,
      endsAt: u.subscriptionEndsAt?.toISOString().split("T")[0],
      petsCount: u._count.pets,
      logsCount: totalLogs,
      lastLogDate: allLogs[0]?.date.toISOString().split("T")[0] || null,
      pets: u.pets.map((p) => ({
        name: p.name,
        breed: p.breed,
        age: p.age,
        logsCount: p._count.healthLogs,
      })),
    };
  });

  writeFileSync("churned-users.json", JSON.stringify(exportData, null, 2));
  console.log("✅ Exported to churned-users.json\n");

  await prisma.$disconnect();
}

analyzeChurnedUsers().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
