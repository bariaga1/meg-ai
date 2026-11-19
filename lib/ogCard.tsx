import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_ROLE } from "@/lib/site";

/** Shared link-preview card for opengraph-image and twitter-image. */
export const OG_ALT = "Omega Bariagaber, Technical Implementation Leader. Portfolio and Meg, his resume chat.";
export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#2a1a10";
const INK_SOFT = "#6a5242";
const PAPER = "#f4ead6";
const ORANGE = "#b8481b";
const ORANGE_BRIGHT = "#e0662a";
const MUSTARD = "#e6a93a";
const TEAL = "#1e5d58";

// Read once per server instance; none of these change per request.
const photo = readFile(join(process.cwd(), "public/images/omega.jpg")).then(
  (buf) => `data:image/jpeg;base64,${buf.toString("base64")}`,
);
const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
const fonts = Promise.all([
  font("Fraunces-Bold.ttf"),
  font("Manrope-Bold.ttf"),
  font("Manrope-ExtraBold.ttf"),
]);

export async function renderOgCard() {
  const [src, [fraunces, manropeBold, manropeExtra]] = await Promise.all([photo, fonts]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", height: 14 }}>
          <div style={{ flex: 1, background: ORANGE }} />
          <div style={{ flex: 1, background: ORANGE_BRIGHT }} />
          <div style={{ flex: 1, background: MUSTARD }} />
          <div style={{ flex: 1, background: TEAL }} />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: ORANGE,
              }}
            >
              Portfolio
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 18,
                fontFamily: "Fraunces",
                fontSize: 88,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              <span>Omega</span>
              <span>Bariagaber</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 26,
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {/* One part per line instead of wrapping mid-phrase at the "|". */}
              {SITE_ROLE.split(" | ").map((part) => (
                <span key={part}>{part}</span>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 36,
                alignSelf: "flex-start",
                border: `3px solid ${INK}`,
                borderRadius: 999,
                padding: "10px 24px",
                background: MUSTARD,
                fontSize: 24,
                fontWeight: 800,
                boxShadow: `4px 4px 0 ${INK}`,
              }}
            >
              Ask Meg about my work →
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "14px 14px 0",
              background: "#fffaf0",
              border: `3px solid ${INK}`,
              boxShadow: `8px 8px 0 ${INK}`,
              transform: "rotate(2.5deg)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
            <img src={src} width={300} height={400} alt="" style={{ objectFit: "cover" }} />
            <div style={{ padding: "12px 0 16px", fontSize: 22, fontWeight: 800, color: INK_SOFT }}>
              Omega
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 700, style: "normal" },
        { name: "Manrope", data: manropeBold, weight: 700, style: "normal" },
        { name: "Manrope", data: manropeExtra, weight: 800, style: "normal" },
      ],
    },
  );
}
