import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "linear-gradient(135deg, rgb(13,43,43) 0%, rgb(13,110,110) 55%, rgb(20,145,155) 100%)",
          color: "white",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: -0.5,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🐾
          </div>
          FursBliss
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.02, letterSpacing: -1.8 }}>
            The longevity command center for your dog.
          </div>
          <div style={{ fontSize: 30, opacity: 0.9 }}>
            Track health trends, supplement risks, and LOY-002 readiness.
          </div>
        </div>

        <div style={{ fontSize: 24, opacity: 0.85 }}>www.fursbliss.com</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
