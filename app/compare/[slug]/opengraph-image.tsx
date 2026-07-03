import { ImageResponse } from "next/og";
import { getComparisonBySlug } from "@/data/comparisons";
import { OGImageLayout, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/shared";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Product comparison on ReviewIQ";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pair = getComparisonBySlug(slug);

  if (!pair) {
    return new ImageResponse(
      <OGImageLayout>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#0f172a", display: "flex" }}>
          ReviewIQ
        </div>
      </OGImageLayout>,
      { ...size }
    );
  }

  const { productA, productB } = pair;

  const scoreColor = (score: number) =>
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return new ImageResponse(
    <OGImageLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* VS badge */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: "#f0f7ff",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 16,
              color: "#005fd4",
              fontWeight: 600,
            }}
          >
            Side-by-Side Comparison
          </div>
        </div>

        {/* Product names with VS */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#0f172a", lineHeight: 1.15 }}>
            {productA.name}
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#005fd4",
              background: "#f0f7ff",
              padding: "4px 16px",
              borderRadius: 12,
            }}
          >
            VS
          </span>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#0f172a", lineHeight: 1.15 }}>
            {productB.name}
          </span>
        </div>

        {/* Score comparison */}
        <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 8 }}>
          {/* Product A score */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: scoreColor(productA.smartScore),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {productA.smartScore}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                {productA.name}
              </span>
              <span style={{ fontSize: 13, color: "#475569" }}>
                {productA.reviewCount.toLocaleString()} reviews
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 40, background: "#e2e8f0", display: "flex" }} />

          {/* Product B score */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: scoreColor(productB.smartScore),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {productB.smartScore}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                {productB.name}
              </span>
              <span style={{ fontSize: 13, color: "#475569" }}>
                {productB.reviewCount.toLocaleString()} reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </OGImageLayout>,
    { ...size }
  );
}
