import { describe, it, expect } from "vitest";
import { buildMetadata, ogImageForSegment } from "../metadata";

const images = (m: ReturnType<typeof buildMetadata>) =>
  (m.openGraph as { images?: { url: string }[] } | undefined)?.images;

describe("buildMetadata — og:image", () => {
  // Regression guard. buildMetadata declares an explicit `openGraph` block, and an
  // explicit block replaces whatever the parent segment resolved — including the
  // card that app/opengraph-image.tsx contributes. When `images` was left off, 56
  // live pages (every hub, /about, legal, community threads & profiles) shipped with
  // NO og:image at all and shared as a bare grey link. Never let `images` be empty.
  it("always emits an image, even when the caller passes none", () => {
    const meta = buildMetadata({ title: "About", path: "/about" });
    expect(images(meta)).toHaveLength(1);
    expect(images(meta)?.[0].url).toMatch(/\/opengraph-image$/);
  });

  it("prefers a caller-supplied image over the site fallback", () => {
    const custom = ogImageForSegment("/compare/a-vs-b");
    const meta = buildMetadata({ title: "A vs B", path: "/compare/a-vs-b", image: custom });
    expect(images(meta)?.[0].url).toBe(custom);
    expect(images(meta)?.[0].url).toContain("/compare/a-vs-b/opengraph-image");
  });

  it("builds absolute segment image URLs", () => {
    expect(ogImageForSegment("/category/robot-vacuums")).toMatch(
      /^https?:\/\/.+\/category\/robot-vacuums\/opengraph-image$/
    );
  });
});
