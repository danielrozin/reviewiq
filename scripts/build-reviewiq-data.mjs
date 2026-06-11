/**
 * Transform the lifted Google Sites manifest (scripts/output/reviewiq-content.json)
 * into a structured, seed-ready TypeScript data file: data/reviewiq-lifted.ts
 *
 * DAN-942 (Phase 1b). Run AFTER scrape-reviewiq.mjs.
 *   node scripts/build-reviewiq-data.mjs
 *
 * Mapping (per acceptance criteria — title, h1, body, images+alt, category):
 *   category index page   → LiftedCategory  (name, slug, description, icon)
 *   individual review page → LiftedProduct   (name=h1, slug, brand, category,
 *                                             description=body, image, alt, video)
 *   static page           → LiftedStaticPage (path, title, body)
 *
 * Author: Fullstack Developer (SmartReview), DAN-942.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(__dirname, "output", "reviewiq-content.json");
const OUT_TS = path.join(ROOT, "data", "reviewiq-lifted.ts");

// Site chrome image srcs (header banner + nav logo) — exclude from product media.
const CHROME_IMG = ["AA5AbUB39_wZVB28mHBauuystxtYg", "AA5AbUCYUH3Po4UVOG-mukEE2fnLO"];
const isChrome = (s) => CHROME_IMG.some((c) => s.includes(c));

// Fixed nav / boilerplate lines present on every page (the expanded site menu).
const NAV_NOISE = new Set([
  "Search this site", "Embedded Files", "Skip to main content", "Skip to navigation",
  "Review IQ Home", "Blog", "Reviews", "Content Creation", "Home goods", "Home Goods",
  "Take me out to the ballgame", "Technology", "On the Green", "About", "Review IQ",
  "Home", "More", "Google Sites", "Report abuse", "Page details", "Page updated",
]);

const CATEGORY_META = {
  "content-creation": { name: "Content Creation", icon: "🎬" },
  "home-goods": { name: "Home Goods", icon: "🏠" },
  "on-the-green": { name: "On the Green", icon: "⛳" },
  "take-me-out-to-the-ballgame": { name: "Take Me Out to the Ballgame", icon: "⚾" },
  "technology": { name: "Technology", icon: "💻" },
};

const GENERIC_FIRST_WORD = new Set([
  "the", "a", "an", "bed/table", "4", "5", "10", "45", "multi-plug", "large", "mobile",
  "flexible", "game", "fuzzy", "party", "baseball", "fence", "easton",
]);

function deriveBrand(h1) {
  if (!h1) return "";
  const first = h1.split(/\s+/)[0];
  if (!first) return "";
  if (GENERIC_FIRST_WORD.has(first.toLowerCase())) return "";
  // Brand-like: starts uppercase / all-caps token.
  if (/^[A-Z]/.test(first)) {
    // "Titan Clad ..." → two-word brand
    if (/^Titan$/i.test(first)) return "Titan Clad";
    return first;
  }
  return "";
}

function bodyLines(page, titleSet) {
  const lines = page.lines || [];
  // Body sits between the nav menu and the "...All rights reserved" footer.
  let start = lines.findIndex((l) => l === "More");
  if (start === -1) {
    // fall back: after the last nav-noise line in the leading block
    let last = -1;
    for (let i = 0; i < lines.length; i++) if (NAV_NOISE.has(lines[i])) last = i;
    start = last;
  }
  let end = lines.findIndex((l) => /all rights reserved/i.test(l));
  if (end === -1) end = lines.length;
  return lines
    .slice(start + 1, end)
    .filter((l) => !NAV_NOISE.has(l))
    .filter((l) => !titleSet.has(l)) // drop related-review nav titles
    .filter((l) => l !== page.title && l !== page.h1)
    .filter((l) => !/^Review IQ/i.test(l));
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const pages = manifest.pages;

  // Set of all review/product display titles → used to strip related-review nav.
  const titleSet = new Set();
  for (const p of pages) {
    if (p.slug && p.h1) titleSet.add(p.h1);
    if (p.slug && p.title) titleSet.add(p.title.replace(/^Review IQ - /, ""));
  }

  // Categories (slug present, no slug-level review → category === set, slug === null)
  const categories = [];
  for (const p of pages) {
    if (p.category && !p.slug && p.path.startsWith("/reviews/")) {
      const meta = CATEGORY_META[p.category] || { name: p.category, icon: "📦" };
      const body = bodyLines(p, titleSet).join(" ").replace(/\s+/g, " ").trim();
      categories.push({
        id: `riq-cat-${p.category}`,
        name: meta.name,
        slug: p.category,
        description: body || `${meta.name} reviews from Review IQ.`,
        icon: meta.icon,
        legacyUrl: p.legacyUrl,
      });
    }
  }

  // Products (review pages)
  const products = [];
  for (const p of pages) {
    if (!(p.category && p.slug)) continue;
    const lines = bodyLines(p, titleSet);
    const headline = lines[0] || "";
    const description = lines.join(" ").replace(/\s+/g, " ").trim();
    const productImgs = (p.images || []).filter((im) => !isChrome(im.src));
    let image = productImgs[0]?.src || "";
    let imageAlt = productImgs[0]?.alt || p.h1 || "";
    const video = (p.videos || [])[0] || null;
    if (!image && video) image = `https://i.ytimg.com/vi/${video}/hqdefault.jpg`;
    if (!image) image = "/images/products/placeholder.svg";
    products.push({
      id: `riq-${p.slug}`,
      name: p.h1 || p.title.replace(/^Review IQ - /, ""),
      slug: p.slug,
      brand: deriveBrand(p.h1),
      categorySlug: p.category,
      categoryId: `riq-cat-${p.category}`,
      headline,
      description,
      image,
      imageAlt,
      images: productImgs.map((im) => ({ src: im.src, alt: im.alt })),
      video,
      legacyUrl: p.legacyUrl,
    });
  }

  // Static pages
  const staticPages = [];
  for (const p of pages) {
    if (p.category) continue;
    const body = bodyLines(p, titleSet).join(" ").replace(/\s+/g, " ").trim();
    staticPages.push({
      path: p.path,
      title: p.title,
      body,
      legacyUrl: p.legacyUrl,
    });
  }

  const banner =
    "// AUTO-GENERATED by scripts/build-reviewiq-data.mjs from the Google Sites lift.\n" +
    "// DAN-942 Phase 1b content lift. Do not edit by hand — re-run the generator.\n" +
    `// Source: ${manifest.sourceBase} | scrapedAt: ${manifest.scrapedAt}\n\n`;

  const ts =
    banner +
    "export interface LiftedCategory {\n  id: string;\n  name: string;\n  slug: string;\n  description: string;\n  icon: string;\n  legacyUrl: string;\n}\n\n" +
    "export interface LiftedProductImage {\n  src: string;\n  alt: string;\n}\n\n" +
    "export interface LiftedProduct {\n  id: string;\n  name: string;\n  slug: string;\n  brand: string;\n  categorySlug: string;\n  categoryId: string;\n  headline: string;\n  description: string;\n  image: string;\n  imageAlt: string;\n  images: LiftedProductImage[];\n  video: string | null;\n  legacyUrl: string;\n}\n\n" +
    "export interface LiftedStaticPage {\n  path: string;\n  title: string;\n  body: string;\n  legacyUrl: string;\n}\n\n" +
    "export const liftedCategories: LiftedCategory[] = " + JSON.stringify(categories, null, 2) + ";\n\n" +
    "export const liftedProducts: LiftedProduct[] = " + JSON.stringify(products, null, 2) + ";\n\n" +
    "export const liftedStaticPages: LiftedStaticPage[] = " + JSON.stringify(staticPages, null, 2) + ";\n";

  fs.writeFileSync(OUT_TS, ts);
  console.log(`Wrote ${path.relative(ROOT, OUT_TS)}`);
  console.log(`  categories: ${categories.length}`);
  console.log(`  products:   ${products.length}`);
  console.log(`  static:     ${staticPages.length}`);
  // quick anomaly report
  const empty = products.filter((p) => p.description.length < 20);
  if (empty.length) console.log("  ⚠ products with thin body:", empty.map((p) => p.slug).join(", "));
}

main();
