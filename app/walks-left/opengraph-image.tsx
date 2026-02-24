import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function WalksLeftOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #2B134E 0%, #4A206D 52%, #D0643B 100%)",
          color: "white",
          fontFamily: "system-ui",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 35%), radial-gradient(circle at 80% 78%, rgba(255,184,120,0.30), transparent 35%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
            padding: "68px 72px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.02 }}>
            <div style={{ display: "flex" }}>How Many Walks Left</div>
            <div style={{ display: "flex" }}>With Your Dog?</div>
          </div>
          <div style={{ fontSize: 32, opacity: 0.95 }}>
            Find out at fursbliss.com/walks-left
          </div>
          <div style={{ fontSize: 26, opacity: 0.82 }}>FursBliss</div>
        </div>
      </div>
    ),
    size
  );
}
