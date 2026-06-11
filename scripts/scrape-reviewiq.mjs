/**
 * Scrape ReviewIQ legacy Google Sites — content lift for the Next.js migration.
 *
 * DAN-942 (Phase 1b). Lifts all editorial content off the legacy Google Sites
 * and writes a structured manifest the seed step consumes.
 *
 * SOURCE NOTE: the custom domain `reviewiq.net` now points at the NEW Next.js
 * app (production cutover happened ahead of schedule — see DAN-941). The legacy
 * Google Sites is still live at its underlying canonical host:
 *     https://sites.google.com/view/review-iq
 * so we lift from there. Unlike the CNAMEd domain, Google Sites' canonical host
 * embeds the rendered page text in the initial HTML, so a plain fetch() recovers
 * title / h1 / body / images — no headless browser / Playwright needed.
 * (The original Phase 0 scraper assumed Playwright because the audit curl'd the
 * CNAMEd domain; lifting from the canonical host removes that dependency.)
 *
 * Usage:
 *   node scripts/scrape-reviewiq.mjs                 # crawl all 34 URLs
 *   node scripts/scrape-reviewiq.mjs --slug technology/10-port-usb-charger
 *   node scripts/scrape-reviewiq.mjs --dry-run       # print URLs only
 *
 * Output: scripts/output/reviewiq-content.json
 *
 * Author: Fullstack Developer (SmartReview), DAN-942.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(__dirname, "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "reviewiq-content.json");

// Legacy public domain (for the redirect map). Content is lifted from the
// canonical Google Sites host below.
const LEGACY_PUBLIC_BASE = "https://reviewiq.net";
const SOURCE_BASE = "https://sites.google.com/view/review-iq";

const STATIC_PAGES = ["/", "/home", "/about", "/blog", "/reviews"];

const CATEGORY_INDEX_PAGES = [
  "/reviews/content-creation",
  "/reviews/home-goods",
  "/reviews/on-the-green",
  "/reviews/take-me-out-to-the-ballgame",
  "/reviews/technology",
];

const REVIEW_PAGES = [
  "/reviews/content-creation/neewer-cube-light",
  "/reviews/home-goods/table-leg-risers",
  "/reviews/home-goods/titan-clad-cutting-board",
  "/reviews/home-goods/welclux-shaver",
  "/reviews/on-the-green/4-pack-ball-markers",
  "/reviews/take-me-out-to-the-ballgame/baseball-bogg-charms",
  "/reviews/take-me-out-to-the-ballgame/baseball-ice-molds",
  "/reviews/take-me-out-to-the-ballgame/baseball-sunflower-seed-bag",
  "/reviews/take-me-out-to-the-ballgame/easton-bomb-bat-grip-tape",
  "/reviews/take-me-out-to-the-ballgame/fence-mounted-phone-holder",
  "/reviews/take-me-out-to-the-ballgame/fuzzy-baseball-mascot",
  "/reviews/take-me-out-to-the-ballgame/party-animals-lanyard",
  "/reviews/technology/10-port-usb-charger",
  "/reviews/technology/4-in-1-switch-2-controller-charger-dock",
  "/reviews/technology/45-w-usb-c-plugs-and-usb-c-cables",
  "/reviews/technology/flexible-overhead-camera-mount",
  "/reviews/technology/game-controller-case",
  "/reviews/technology/inchoi-cases-dji-osmo-pocket-3-hard-case",
  "/reviews/technology/large-capacity-power-bank",
  "/reviews/technology/mobile-phone-magnetic-vent-clip",
  "/reviews/technology/multi-plug-surge-protector",
  "/reviews/technology/raubay-monitor-camera-mount",
  "/reviews/technology/suncat-wallet-with-find-my-tracking",
  "/reviews/technology/switch-2-joy-con-controllers",
  "/reviews/technology/zyqeee-phone-screen-protector",
];

const ALL_PATHS = [...STATIC_PAGES, ...CATEGORY_INDEX_PAGES, ...REVIEW_PAGES];

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { dryRun: false, singleSlug: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") out.dryRun = true;
    else if (args[i] === "--slug") out.singleSlug = args[++i];
  }
  return out;
}

function deriveCategoryAndSlug(urlPath) {
  const parts = urlPath.split("/").filter(Boolean);
  if (parts[0] !== "reviews") return { category: null, slug: null };
  return { category: parts[1] || null, slug: parts[2] || null };
}

function decodeEntities(s) {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ");
}

/** Extract structured content from a Google Sites HTML string. */
function extractContent(html) {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  const rawTitle = (clean.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const title = decodeEntities(rawTitle).trim();

  const h1 = decodeEntities(
    ((clean.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "").replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim() || null;

  // Ordered visible text lines (block-level boundaries → newlines).
  const blockText = clean
    .replace(/<\/(p|div|h[1-6]|li|br|section|article)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const seen = new Set();
  const lines = decodeEntities(blockText)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 1)
    .filter((l) => {
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    });

  const bodyText = lines.join(" ").replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

  // Images hosted on Google user content (the real page media).
  const images = [];
  const imgSeen = new Set();
  for (const m of clean.matchAll(/<img[^>]+>/gi)) {
    const tag = m[0];
    const src = (tag.match(/\ssrc="([^"]+)"/i) || [])[1] || "";
    if (!src || src.startsWith("data:")) continue;
    if (!/googleusercontent|lh\d\.google/i.test(src)) continue;
    if (imgSeen.has(src)) continue;
    imgSeen.add(src);
    const alt = decodeEntities((tag.match(/\salt="([^"]*)"/i) || [])[1] || "").trim();
    images.push({ src, alt });
  }

  // YouTube embeds (several reviews link a companion video).
  const videos = [];
  for (const m of clean.matchAll(/(?:youtube\.com\/embed\/|youtu\.be\/|watch\?v=)([A-Za-z0-9_-]{11})/g)) {
    if (!videos.includes(m[1])) videos.push(m[1]);
  }

  return { title, h1, lines, bodyText, wordCount, images, videos };
}

async function scrapeOne(urlPath) {
  const url = SOURCE_BASE + urlPath;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const html = await res.text();
  const data = extractContent(html);
  const { category, slug } = deriveCategoryAndSlug(urlPath);
  return {
    legacyUrl: LEGACY_PUBLIC_BASE + urlPath,
    sourceUrl: url,
    path: urlPath,
    httpStatus: res.status,
    category,
    slug,
    ...data,
  };
}

async function main() {
  const { dryRun, singleSlug } = parseArgs();

  const targets = singleSlug
    ? ALL_PATHS.filter((p) => p.endsWith(singleSlug) || p === `/${singleSlug}`)
    : ALL_PATHS;

  if (!targets.length) {
    console.error(`No matching path for --slug ${singleSlug}`);
    process.exit(1);
  }

  console.log(`ReviewIQ content lift: ${targets.length} URL(s) from ${SOURCE_BASE}`);
  if (dryRun) {
    targets.forEach((t) => console.log("  " + SOURCE_BASE + t));
    console.log("--dry-run: exiting without crawling.");
    return;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const pages = [];
  let i = 0;
  for (const p of targets) {
    i++;
    process.stdout.write(`[${i}/${targets.length}] ${p} ... `);
    try {
      const r = await scrapeOne(p);
      pages.push(r);
      console.log(`ok [${r.httpStatus}] (${r.wordCount}w, ${r.images.length} imgs, ${r.videos.length} vid)`);
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      pages.push({ legacyUrl: LEGACY_PUBLIC_BASE + p, path: p, error: err.message });
    }
    // be polite to Google Sites
    await new Promise((r) => setTimeout(r, 400));
  }

  const out = {
    scrapedAt: new Date().toISOString(),
    legacyPublicBase: LEGACY_PUBLIC_BASE,
    sourceBase: SOURCE_BASE,
    pageCount: pages.length,
    pages,
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${pages.length} page(s) to ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
