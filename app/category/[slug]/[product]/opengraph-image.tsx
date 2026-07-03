import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/data/products";
import { getCategoryBySlug } from "@/data/categories";
import { OGImageLayout, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/shared";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Product review on ReviewIQ";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string; product: string }>;
}) {
  const { slug, product: productSlug } = await params;
  const product = getProductBySlug(slug, productSlug);
  const category = getCategoryBySlug(slug);

  if (!product || !category) {
    return new ImageResponse(
      <OGImageLayout>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#0f172a", display: "flex" }}>
          ReviewIQ
        </div>
      </OGImageLayout>,
      { ...size }
    );
  }

  const rating = (
    Object.entries(product.ratingDistribution).reduce(
      (sum, [stars, count]) => sum + Number(stars) * count,
      0
    ) / product.reviewCount
  ).toFixed(1);

  const scoreColor =
    product.smartScore >= 80
      ? "#10b981"
      : product.smartScore >= 60
        ? "#f59e0b"
        : "#ef4444";

  return new ImageResponse(
    <OGImageLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Category badge */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#f0f7ff",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 16,
              color: "#005fd4",
              fontWeight: 600,
            }}
          >
            {category.icon} {category.name}
          </div>
        </div>

        {/* Product name */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.15,
            display: "flex",
          }}
        >
          {product.name}
        </div>

        {/* Metrics row */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 8 }}>
          {/* SmartScore */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: scoreColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              {product.smartScore}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>
                SmartScore
              </span>
              <span style={{ fontSize: 14, color: "#475569" }}>out of 100</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 40, background: "#e2e8f0", display: "flex" }} />

          {/* Star rating */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                {rating}
              </span>
              <span style={{ fontSize: 20, color: "#f59e0b" }}>★</span>
            </div>
            <span style={{ fontSize: 14, color: "#475569" }}>
              {product.reviewCount.toLocaleString()} reviews
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 40, background: "#e2e8f0", display: "flex" }} />

          {/* Verified rate */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>
              {product.verifiedPurchaseRate}%
            </span>
            <span style={{ fontSize: 14, color: "#475569" }}>Verified buyers</span>
          </div>
        </div>
      </div>
    </OGImageLayout>,
    { ...size }
  );
}
