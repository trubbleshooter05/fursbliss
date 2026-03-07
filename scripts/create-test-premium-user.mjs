/**
 * Creates (or upgrades) a test premium user for local testing.
 * Run: node scripts/create-test-premium-user.mjs
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Load env
import { config } from "dotenv";
config({ path: ".env.local" });

const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TEST_EMAIL = "test+premium@fursbliss.com";
const TEST_PASSWORD_HASH =
  // bcrypt hash of "testpremium123" — pre-hashed so no bcrypt dep needed
  "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FEs4qDN9b3ZhqjUvHHRIgCNxqWmEVEC"; // "testpremium123"

async function main() {
  const client = await pool.connect();

  try {
    // Check if user already exists
    const existing = await client.query(
      `SELECT id, email, "subscriptionStatus" FROM "User" WHERE email = $1`,
      [TEST_EMAIL]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.subscriptionStatus === "premium") {
        console.log(`\n✅ Test premium user already exists:`);
        console.log(`   Email:    ${TEST_EMAIL}`);
        console.log(`   Password: testpremium123`);
        console.log(`   ID:       ${user.id}`);
        return;
      }

      // Upgrade existing to premium
      await client.query(
        `UPDATE "User"
         SET "subscriptionStatus" = 'premium',
             "subscriptionPlan" = 'monthly',
             "subscriptionEndsAt" = NOW() + INTERVAL '1 year'
         WHERE id = $1`,
        [user.id]
      );
      console.log(`\n✅ Upgraded existing user to premium:`);
      console.log(`   Email:    ${TEST_EMAIL}`);
      console.log(`   Password: testpremium123`);
      console.log(`   ID:       ${user.id}`);
      return;
    }

    // Create new user
    const result = await client.query(
      `INSERT INTO "User" (
         id, email, name, password,
         "subscriptionStatus", "subscriptionPlan", "subscriptionEndsAt",
         "createdAt", "updatedAt"
       ) VALUES (
         gen_random_uuid()::text,
         $1, $2, $3,
         'premium', 'monthly', NOW() + INTERVAL '1 year',
         NOW(), NOW()
       ) RETURNING id, email`,
      [TEST_EMAIL, "Test Premium User", TEST_PASSWORD_HASH]
    );

    const newUser = result.rows[0];
    console.log(`\n✅ Created test premium user:`);
    console.log(`   Email:    ${TEST_EMAIL}`);
    console.log(`   Password: testpremium123`);
    console.log(`   ID:       ${newUser.id}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
