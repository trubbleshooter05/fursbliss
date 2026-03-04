import { config } from "dotenv";
import { resolve } from "path";

// Load production environment variables
config({ path: resolve(process.cwd(), ".env.production") });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY not found in .env.production");
  process.exit(1);
}

async function checkStripeCustomers() {
  console.log("🔍 Checking Stripe customers...\n");

  try {
    // Get all customers
    const customersResponse = await fetch(
      "https://api.stripe.com/v1/customers?limit=100",
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!customersResponse.ok) {
      throw new Error(`Stripe API error: ${customersResponse.statusText}`);
    }

    const customersData = await customersResponse.json();
    const customers = customersData.data;

    console.log(`📊 Total Stripe customers: ${customers.length}`);

    // Get customers with active subscriptions
    const activeCustomers = customers.filter(
      (c: any) => c.subscriptions?.data?.length > 0
    );
    console.log(`💰 Customers with active subscriptions: ${activeCustomers.length}`);

    // Get customers without subscriptions
    const inactiveCustomers = customers.filter(
      (c: any) => !c.subscriptions?.data || c.subscriptions.data.length === 0
    );
    console.log(`📧 Customers without subscriptions: ${inactiveCustomers.length}\n`);

    // Show recent customers (last 10)
    console.log("📅 Recent customers (last 10):");
    customers
      .sort((a: any, b: any) => b.created - a.created)
      .slice(0, 10)
      .forEach((customer: any) => {
        const date = new Date(customer.created * 1000).toISOString().split("T")[0];
        const hasSubscription = customer.subscriptions?.data?.length > 0;
        console.log(
          `- ${customer.email} (${date}) ${hasSubscription ? "✅ PAID" : "⭕ NO SUB"}`
        );
      });

    // Check for customers created since Feb 8
    const febCutoff = new Date("2026-02-08").getTime() / 1000;
    const recentCustomers = customers.filter((c: any) => c.created >= febCutoff);
    console.log(`\n🆕 Customers since Feb 8, 2026: ${recentCustomers.length}`);

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkStripeCustomers();
