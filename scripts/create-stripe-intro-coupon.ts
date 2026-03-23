/**
 * Creates a Stripe coupon for the $4.99 intro offer (45% off for 3 months).
 * Run: npx tsx scripts/create-stripe-intro-coupon.ts
 * For production: npx tsx scripts/create-stripe-intro-coupon.ts --production
 *
 * Then add the coupon ID to .env: STRIPE_INTRO_COUPON_ID=coupon_xxx
 */

import { config } from "dotenv";
import { resolve } from "path";
import Stripe from "stripe";

if (process.argv.includes("--production")) {
  config({ path: resolve(process.cwd(), ".env.production") });
} else {
  config({ path: resolve(process.cwd(), ".env.local") });
  config({ path: resolve(process.cwd(), ".env") });
}

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error("STRIPE_SECRET_KEY required");
  process.exit(1);
}

const stripe = new Stripe(secret);

async function main() {
  const coupon = await stripe.coupons.create({
    percent_off: 45,
    duration: "repeating",
    duration_in_months: 3,
    name: "First 3 months $4.99",
  });

  console.log("Created coupon:", coupon.id);
  console.log("Add to .env: STRIPE_INTRO_COUPON_ID=" + coupon.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
