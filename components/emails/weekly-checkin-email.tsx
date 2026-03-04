import * as React from "react";

type WeeklyCheckInEmailProps = {
  userName: string;
  dogName: string;
  dogBreed: string;
  checkInUrl: string;
  weekNumber: number;
};

export function WeeklyCheckInEmail({
  userName,
  dogName,
  dogBreed,
  checkInUrl,
  weekNumber,
}: WeeklyCheckInEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111827", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#059669", padding: "24px", borderRadius: "12px 12px 0 0" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          How was {dogName}'s week?
        </h1>
      </div>

      <div style={{ padding: "32px 24px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 12px 12px" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.5", marginTop: 0 }}>
          Hi {userName},
        </p>

        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
          It's been another week with {dogName}! Take 60 seconds to record how they're doing — it helps us spot patterns early.
        </p>

        <div style={{ backgroundColor: "white", border: "2px solid #059669", borderRadius: "8px", padding: "20px", margin: "24px 0" }}>
          <p style={{ margin: "0 0 12px 0", fontWeight: "600", fontSize: "14px", color: "#059669" }}>
            📊 WEEK {weekNumber} CHECK-IN
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            ✓ Any new symptoms?<br />
            ✓ Energy level better/same/worse?<br />
            ✓ Appetite better/same/worse?<br />
            ✓ Any vet visits?
          </p>
        </div>

        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a
            href={checkInUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#059669",
              color: "white",
              padding: "16px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Complete {dogName}'s Check-In →
          </a>
        </div>

        <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "8px", padding: "16px", marginTop: "24px" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#92400e" }}>
            <strong>💡 Why weekly check-ins?</strong><br />
            Consistent tracking helps catch subtle declines 3 months before they become emergencies. Your {dogBreed}'s breed is prone to age-related changes that weekly monitoring can detect early.
          </p>
        </div>

        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "32px", marginBottom: 0 }}>
          Need help? Reply to this email or visit our{" "}
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={{ color: "#059669" }}>
            dashboard
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export function WeeklyCheckInEmailText({
  userName,
  dogName,
  checkInUrl,
  weekNumber,
}: WeeklyCheckInEmailProps) {
  return `How was ${dogName}'s week?

Hi ${userName},

It's been another week with ${dogName}! Take 60 seconds to record how they're doing — it helps us spot patterns early.

WEEK ${weekNumber} CHECK-IN:
✓ Any new symptoms?
✓ Energy level better/same/worse?
✓ Appetite better/same/worse?
✓ Any vet visits?

Complete ${dogName}'s Check-In:
${checkInUrl}

Why weekly check-ins?
Consistent tracking helps catch subtle declines 3 months before they become emergencies.

Need help? Visit: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

---
FursBliss
Catch health problems before they become emergencies`;
}
