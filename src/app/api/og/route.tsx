import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title    = searchParams.get("title")    ?? "Fena Daily";
  const category = searchParams.get("category") ?? "";
  const type     = searchParams.get("type")     ?? "site"; // "article" | "category" | "site"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #08111f 0%, #111827 55%, #020617 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: site name */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#fbbf24",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Fena Daily
          </span>
          {category && (
            <>
              <span style={{ color: "#374151", fontSize: 16 }}>·</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fcd34d",
                  background: "rgba(251,191,36,0.12)",
                  padding: "3px 12px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {category}
              </span>
            </>
          )}
        </div>

        {/* Middle: title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              fontSize: type === "site" ? 72 : 52,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 960,
            }}
          >
            {title}
          </span>
          {type === "site" && (
            <span style={{ fontSize: 22, color: "#9ca3af", lineHeight: 1.5, maxWidth: 700 }}>
              Independent coverage of AI, Football, Crypto, Business, Technology, and Personal Growth.
            </span>
          )}
        </div>

        {/* Bottom: domain */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: "#fbbf24",
            }}
          />
          <span style={{ fontSize: 16, color: "#6b7280" }}>fenadaily.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
