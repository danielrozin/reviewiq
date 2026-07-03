import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/shared";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "ReviewIQ — Real Reviews, Real Intelligence";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          background: "white",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 6, background: "#005fd4", display: "flex" }} />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: "48px 64px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#005fd4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            RIQ
          </div>

          {/* Brand name */}
          <div style={{ fontSize: 64, fontWeight: 800, color: "#0f172a", display: "flex" }}>
            ReviewIQ
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 24, color: "#475569", display: "flex" }}>
            Real Reviews, Real Intelligence
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {["AI-Powered Analysis", "Verified Buyers", "SmartScore Rating"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    background: "#f0f7ff",
                    padding: "8px 20px",
                    borderRadius: 24,
                    fontSize: 16,
                    color: "#005fd4",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div style={{ height: 6, background: "#005fd4", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
