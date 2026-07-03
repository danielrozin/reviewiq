import { ImageResponse } from "next/og";
import { getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { OGImageLayout, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/shared";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Product category on ReviewIQ";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return new ImageResponse(
      <OGImageLayout>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#0f172a", display: "flex" }}>
          ReviewIQ
        </div>
      </OGImageLayout>,
      { ...size }
    );
  }

  const products = getProductsByCategory(slug);
  const topProduct = products.sort((a, b) => b.smartScore - a.smartScore)[0];

  return new ImageResponse(
    <OGImageLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Category icon + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 56 }}>{category.icon}</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, color: "#005fd4", fontWeight: 600 }}>
              CATEGORY
            </span>
            <span style={{ fontSize: 48, fontWeight: 800, color: "#0f172a" }}>
              Best {category.name}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 8 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#005fd4" }}>
              {products.length}
            </span>
            <span style={{ fontSize: 16, color: "#475569" }}>Products reviewed</span>
          </div>

          <div style={{ width: 1, height: 48, background: "#e2e8f0", display: "flex" }} />

          {topProduct && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 16, color: "#475569" }}>Top rated</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                {topProduct.name}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "white",
                    background: "#10b981",
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  {topProduct.smartScore}/100
                </span>
                <span style={{ fontSize: 14, color: "#475569" }}>SmartScore</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </OGImageLayout>,
    { ...size }
  );
}
