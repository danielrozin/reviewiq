import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/data/blog-posts";
import { OGImageLayout, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/shared";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Blog article on ReviewIQ";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      <OGImageLayout>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#0f172a", display: "flex" }}>
          ReviewIQ Blog
        </div>
      </OGImageLayout>,
      { ...size }
    );
  }

  return new ImageResponse(
    <OGImageLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Category + reading time */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            {post.categoryName}
          </div>
          <span style={{ fontSize: 16, color: "#475569" }}>
            {post.readingTime} min read
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.2,
            display: "flex",
            maxWidth: 1000,
          }}
        >
          {post.title.length > 80 ? post.title.slice(0, 77) + "..." : post.title}
        </div>

        {/* Author + date */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "#005fd4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {post.author.name.charAt(0)}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
              {post.author.name}
            </span>
            <span style={{ fontSize: 14, color: "#475569" }}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </OGImageLayout>,
    { ...size }
  );
}
