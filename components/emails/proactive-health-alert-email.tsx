import * as React from "react";

export type ProactiveHealthAlertEmailProps = {
  userName: string;
  petName: string;
  petBreed: string;
  metricLabel: string;
  pctChange: number;
  currentAvg: number;
  previousAvg: number;
  recommendation: string;
  breedNote?: string;
  reportUrl: string;
};

export function ProactiveHealthAlertEmail({
  userName,
  petName,
  petBreed,
  metricLabel,
  pctChange,
  currentAvg,
  previousAvg,
  recommendation,
  breedNote,
  reportUrl,
}: ProactiveHealthAlertEmailProps) {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          backgroundColor: "#ea580c",
          color: "#ffffff",
          padding: "28px 24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "600" }}>
          ⚠️ {petName}&apos;s {metricLabel} has declined {Math.abs(Math.round(pctChange))}%
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: "14px", opacity: 0.95 }}>FursBliss health insight</p>
      </div>
      <div style={{ padding: "28px 24px", color: "#334155", lineHeight: 1.6 }}>
        <p style={{ marginTop: 0 }}>Hi {userName},</p>
        <p>
          Based on your daily health logs, <strong>{petName}</strong>&apos;s {metricLabel} scores have dropped
          compared to last week.
        </p>
        <div
          style={{
            backgroundColor: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "12px",
            padding: "16px",
            margin: "20px 0",
          }}
        >
          <p style={{ margin: "0 0 8px" }}>
            <strong>Current 7-day average:</strong> {currentAvg.toFixed(1)}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Previous 7-day average:</strong> {previousAvg.toFixed(1)}
          </p>
        </div>
        {breedNote ? (
          <p style={{ fontSize: "15px" }}>
            <strong>Breed context ({petBreed}):</strong> {breedNote}
          </p>
        ) : null}
        <p style={{ marginTop: "24px" }}>
          <strong>Recommended next step:</strong>
        </p>
        <p style={{ marginTop: "8px" }}>{recommendation}</p>
        <p style={{ marginTop: "28px" }}>
          <a
            href={reportUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#059669",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            View full health report
          </a>
        </p>
        <p style={{ marginTop: "32px", fontSize: "13px", color: "#64748b" }}>— FursBliss</p>
      </div>
    </div>
  );
}
