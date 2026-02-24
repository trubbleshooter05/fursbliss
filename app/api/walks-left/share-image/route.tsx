import { ImageResponse } from "next/og";
import { parseWalksLeftShareFromSearchParams } from "@/lib/walks-left-share";

export const runtime = "nodejs";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload = parseWalksLeftShareFromSearchParams(searchParams);

  const title = payload
    ? `${payload.name} has ${payload.walks.toLocaleString()} walks left`
    : "How Many Walks Left With Your Dog?";
  const subtitle = payload
    ? `${payload.weekends.toLocaleString()} weekends • ${payload.sunsets.toLocaleString()} sunsets`
    : "Find out at fursbliss.com/walks-left";
  const breedText = payload ? payload.breed : "Free emotional calculator";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #2B134E 0%, #4A206D 52%, #D0643B 100%)",
          color: "white",
          overflow: "hidden",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.26), transparent 33%), radial-gradient(circle at 86% 80%, rgba(255,184,120,0.28), transparent 36%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 70px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 24, opacity: 0.86 }}>{breedText}</div>
            <div style={{ display: "flex", fontSize: 66, fontWeight: 700, lineHeight: 1.04 }}>{title}</div>
            <div style={{ display: "flex", fontSize: 34, opacity: 0.95 }}>{subtitle}</div>
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, opacity: 0.88 }}>
            fursbliss.com/walks-left
          </div>
        </div>
      </div>
    ),
    size
  );
}
