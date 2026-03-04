import { config } from "dotenv";
import { resolve } from "path";

// Load production environment variables
config({ path: resolve(process.cwd(), ".env.production") });

console.log("🔧 Testing Meta CAPI...\n");

const pixelId = process.env.META_PIXEL_ID;
const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
const testEventCode = process.env.META_TEST_EVENT_CODE;

console.log(`Pixel ID: ${pixelId}`);
console.log(`Access Token: ${accessToken ? `${accessToken.slice(0, 20)}...` : "MISSING"}`);
console.log(`Test Event Code: ${testEventCode}\n`);

if (!pixelId || !accessToken) {
  console.error("❌ Missing META_PIXEL_ID or META_CONVERSIONS_API_TOKEN");
  process.exit(1);
}

async function testCAPI() {
  const event = {
    event_name: "TriageCompleted",
    event_time: Math.floor(Date.now() / 1000),
    event_id: "test-" + Date.now(),
    event_source_url: "https://www.fursbliss.com/triage",
    action_source: "website",
    custom_data: {
      urgency_level: "VET_SOON",
      pet_name: "TestDog",
      test: true,
    },
  };

  const payload = {
    data: [event],
    test_event_code: testEventCode || undefined,
  };

  console.log("📤 Sending event:", JSON.stringify(event, null, 2));

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    console.log(`\n📥 Response status: ${response.status}`);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error("\n❌ ERROR:", result.error?.message || "Unknown error");
      console.error("Full error:", result);
      process.exit(1);
    }

    console.log("\n✅ SUCCESS! Event sent to Meta.");
    console.log(`Events received: ${result.events_received}`);
    console.log(`Messages: ${JSON.stringify(result.messages)}`);
  } catch (error) {
    console.error("\n❌ FETCH ERROR:", error);
    process.exit(1);
  }
}

testCAPI();
