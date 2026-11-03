import { ImageResponse } from "next/og";

export const alt = "Meg — ask about Omega Bariagaber";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** LinkedIn / Slack / iMessage link preview card. */
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
          padding: "64px 72px",
          background: "linear-gradient(145deg, #0c3d4a 0%, #1a6b7a 48%, #c9a27a 100%)",
          color: "#f7f3ec",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "radial-gradient(circle at 35% 30%, #ffe8c8 0%, #e8a060 45%, #7a3f1a 100%)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          />
          Meg
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: 920,
            }}
          >
            Ask about Omega Bariagaber
          </div>
          <div style={{ fontSize: 28, opacity: 0.92, maxWidth: 820, lineHeight: 1.35 }}>
            Resume chat for roles, skills, and projects — grounded answers only.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
