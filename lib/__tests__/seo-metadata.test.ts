import { describe, it, expect } from "vitest";
import {
  buildMetadata,
  fitTitle,
  truncateAtWord,
  TITLE_MAX,
  DESCRIPTION_MAX,
} from "../seo/metadata";

const titleOf = (m: ReturnType<typeof buildMetadata>) => m.title as string;

describe("fitTitle", () => {
  it("keeps the richest candidate that fits the render budget", () => {
    const chosen = fitTitle([
      "Sonos Era 100 vs Echo Studio (2026) — Which Is Better?", // 53, fits
      "Sonos Era 100 vs Echo Studio (2026)",
      "Sonos Era 100 vs Echo Studio",
    ]);
    expect(chosen).toBe("Sonos Era 100 vs Echo Studio (2026) — Which Is Better?");
    expect(chosen.length).toBeLessThanOrEqual(TITLE_MAX);
  });

  it("prefers a longer in-budget candidate over a short one that would keep the brand", () => {
    const chosen = fitTitle(["A".repeat(70), "B".repeat(55), "C".repeat(20)]);
    expect(chosen).toBe("B".repeat(55));
    // ...and the brand is what gives way, not the title.
    expect(titleOf(buildMetadata({ title: chosen }))).toBe("B".repeat(55));
  });

  it("returns the floor candidate even when it overflows, rather than mangling the keyword", () => {
    const keyword = "Philips Sonicare DiamondClean Smart 9700 vs Quip Smart Electric Toothbrush";
    expect(fitTitle([`${keyword} (2026) — Which Is Better?`, keyword])).toBe(keyword);
  });
});

describe("truncateAtWord", () => {
  it("leaves text that already fits untouched", () => {
    expect(truncateAtWord("Short enough", 40)).toBe("Short enough");
  });

  it("cuts on a word boundary and marks the elision", () => {
    const out = truncateAtWord("the quick brown fox jumps over the lazy dog", 20);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out).toBe("the quick brown fox…");
    expect(out).not.toContain("jum");
  });

  it("does not leave dangling punctuation before the ellipsis", () => {
    expect(truncateAtWord("Roborock S8 MaxV vs Dreame L20 Ultra — honest take", 40)).toBe(
      "Roborock S8 MaxV vs Dreame L20 Ultra…",
    );
  });
});

describe("buildMetadata title", () => {
  it("appends the brand when the title has room", () => {
    expect(titleOf(buildMetadata({ title: "About" }))).toBe("About | ReviewIQ");
  });

  it("drops the brand rather than let the title truncate", () => {
    const long = "Best Portable Power Stations (2026) — Reviews & Comparisons"; // 58
    const title = titleOf(buildMetadata({ title: long }));
    expect(title).toBe(long);
    expect(title).not.toContain("| ReviewIQ");
  });

  it("never brands a title twice", () => {
    const title = titleOf(buildMetadata({ title: "ReviewIQ Community" }));
    expect(title.match(/ReviewIQ/g)).toHaveLength(1);
  });

  it("keeps every title that fits within Google's render budget", () => {
    for (const t of ["About", "Pricing", "Compare Products Side-by-Side — Specs & Reviews"]) {
      expect(titleOf(buildMetadata({ title: t })).length).toBeLessThanOrEqual(TITLE_MAX);
    }
  });

  it("passes the description through untouched", () => {
    const d = "x".repeat(DESCRIPTION_MAX);
    expect(buildMetadata({ description: d }).description).toBe(d);
  });
});
