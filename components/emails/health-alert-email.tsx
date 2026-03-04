import * as React from "react";

type HealthFlag = {
  id: string;
  type: "red" | "yellow" | "green";
  title: string;
  description: string;
};

type HealthAlertEmailProps = {
  userName: string;
  petName: string;
  petBreed: string;
  oldScore: number;
  newScore: number;
  scoreTrend: "improving" | "stable" | "declining";
  flags: HealthFlag[];
  dashboardUrl: string;
};

export function HealthAlertEmail({
  userName,
  petName,
  petBreed,
  oldScore,
  newScore,
  scoreTrend,
  flags,
  dashboardUrl,
}: HealthAlertEmailProps) {
  const scoreChange = newScore - oldScore;
  const redFlags = flags.filter((f) => f.type === "red");
  const yellowFlags = flags.filter((f) => f.type === "yellow");
  const greenFlags = flags.filter((f) => f.type === "green");

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#f97316",
          color: "#ffffff",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "600" }}>
          {scoreTrend === "declining" ? "⚠️ " : scoreTrend === "improving" ? "✅ " : ""}
          Health Update for {petName}
        </h1>
        <p style={{ margin: 0, fontSize: "16px", opacity: 0.9 }}>
          Daily insights from FursBliss
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "32px 24px" }}>
        {/* Greeting */}
        <p style={{ fontSize: "16px", color: "#334155", lineHeight: "1.6", marginTop: 0 }}>
          Hi {userName},
        </p>

        {/* Health Score Change */}
        {scoreChange !== 0 && (
          <div
            style={{
              backgroundColor: scoreChange < 0 ? "#fef2f2" : "#f0fdf4",
              border: `2px solid ${scoreChange < 0 ? "#fca5a5" : "#86efac"}`,
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "700",
                  color: scoreChange < 0 ? "#dc2626" : "#16a34a",
                }}
              >
                {scoreChange > 0 ? "+" : ""}
                {scoreChange}
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
                  Health Score Change
                </div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a" }}>
                  {oldScore} → {newScore}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#dc2626",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🔴 Urgent Attention Needed
            </h2>
            {redFlags.map((flag) => (
              <div
                key={flag.id}
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#991b1b", marginBottom: "4px" }}>
                  {flag.title}
                </div>
                <div style={{ fontSize: "14px", color: "#7f1d1d", lineHeight: "1.5" }}>
                  {flag.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Yellow Flags */}
        {yellowFlags.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#d97706",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ⚠️ Watch Closely
            </h2>
            {yellowFlags.map((flag) => (
              <div
                key={flag.id}
                style={{
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde047",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#92400e", marginBottom: "4px" }}>
                  {flag.title}
                </div>
                <div style={{ fontSize: "14px", color: "#78350f", lineHeight: "1.5" }}>
                  {flag.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Green Flags */}
        {greenFlags.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#16a34a",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ✅ Good News
            </h2>
            {greenFlags.map((flag) => (
              <div
                key={flag.id}
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#15803d", marginBottom: "4px" }}>
                  {flag.title}
                </div>
                <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.5" }}>
                  {flag.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No changes message */}
        {flags.length === 0 && scoreChange === 0 && (
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
              {petName}'s health metrics are stable. Keep up the great work! 🎉
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <a
            href={dashboardUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#f97316",
              color: "#ffffff",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            View Full Dashboard
          </a>
        </div>

        {/* Footer note */}
        <p
          style={{
            fontSize: "14px",
            color: "#64748b",
            lineHeight: "1.6",
            marginTop: "32px",
            marginBottom: 0,
          }}
        >
          💡 Keep logging {petName}'s daily health to catch patterns early. Even 30 seconds a day
          can help you spot issues before they become emergencies.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "24px",
          textAlign: "center",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0" }}>
          You're receiving this because you have premium health alerts enabled.
        </p>
        <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
          <a
            href={`${dashboardUrl}/account`}
            style={{ color: "#f97316", textDecoration: "none" }}
          >
            Manage email preferences
          </a>
        </p>
      </div>
    </div>
  );
}

// Plain text version for email clients that don't support HTML
export function HealthAlertEmailText({
  userName,
  petName,
  oldScore,
  newScore,
  scoreTrend,
  flags,
  dashboardUrl,
}: HealthAlertEmailProps) {
  const scoreChange = newScore - oldScore;
  const redFlags = flags.filter((f) => f.type === "red");
  const yellowFlags = flags.filter((f) => f.type === "yellow");
  const greenFlags = flags.filter((f) => f.type === "green");

  let text = `Health Update for ${petName}\n\n`;
  text += `Hi ${userName},\n\n`;

  if (scoreChange !== 0) {
    text += `Health Score Change: ${oldScore} → ${newScore} (${scoreChange > 0 ? "+" : ""}${scoreChange})\n\n`;
  }

  if (redFlags.length > 0) {
    text += `🔴 URGENT ATTENTION NEEDED:\n\n`;
    redFlags.forEach((flag) => {
      text += `${flag.title}\n${flag.description}\n\n`;
    });
  }

  if (yellowFlags.length > 0) {
    text += `⚠️ WATCH CLOSELY:\n\n`;
    yellowFlags.forEach((flag) => {
      text += `${flag.title}\n${flag.description}\n\n`;
    });
  }

  if (greenFlags.length > 0) {
    text += `✅ GOOD NEWS:\n\n`;
    greenFlags.forEach((flag) => {
      text += `${flag.title}\n${flag.description}\n\n`;
    });
  }

  if (flags.length === 0 && scoreChange === 0) {
    text += `${petName}'s health metrics are stable. Keep up the great work!\n\n`;
  }

  text += `View your full dashboard: ${dashboardUrl}\n\n`;
  text += `Keep logging ${petName}'s daily health to catch patterns early.\n\n`;
  text += `---\n`;
  text += `Manage email preferences: ${dashboardUrl}/account\n`;

  return text;
}
