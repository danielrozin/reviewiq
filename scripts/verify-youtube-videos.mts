/**
 * Verifies every youtubeVideos[] entry in data/products*.ts against YouTube itself.
 *
 * The seeded video data was never checked against the real world: most video IDs
 * do not exist, some point at a review of a DIFFERENT product, and every stored
 * title was written by hand rather than read from YouTube. All three end up in the
 * VideoObject JSON-LD and in the on-page "Video Reviews" embeds.
 *
 * A video survives only if YouTube confirms it exists AND its real title actually
 * refers to the product. Survivors are rewritten with the title, channel and
 * uploadDate reported by YouTube, so the data file only holds facts we checked.
 *
 * Safety: "YouTube says this video is gone" and "YouTube did not answer" must never
 * be confused — a rate-limited run would otherwise delete the whole catalog. Only a
 * definitive 404 marks a video dead; anything else is retried, and if it is still
 * unresolved the run refuses to write.
 *
 *   npx tsx scripts/verify-youtube-videos.mts          # report only
 *   npx tsx scripts/verify-youtube-videos.mts --write  # apply to data/products*.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { getAllProducts } from "../data/products";

const WRITE = process.argv.includes("--write");
const DATA_FILES = [
  "data/products.ts",
  "data/products-batch1.ts",
  "data/products-batch2.ts",
  "data/products-batch3.ts",
];

type Verdict = "verified" | "off-product" | "dead" | "unresolved";

interface Checked {
  videoId: string;
  product: string;
  slug: string;
  stored: string;
  verdict: Verdict;
  realTitle?: string;
  channel?: string;
  uploadDate?: string;
}

// Words that carry no identifying signal ("Pro", "Ultra", "2" appear across half the
// catalog), so they must never be what qualifies a video as being about this product.
const GENERIC = new Set([
  "the", "and", "for", "with", "pro", "plus", "max", "ultra", "series", "gen",
  "inch", "edition", "smart", "wireless", "1", "2", "3", "4", "5", "6", "7", "8", "9",
]);

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ");
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Does the title YouTube actually publishes refer to this product? Brand alone is not
 * enough — "Sony XM5" and "Sony WF-1000XM5" are different products — so we require the
 * product's distinctive model tokens. Tokens are matched against the squashed title as
 * well, because creators write "dual brew" where the catalog says "DualBrew".
 *
 * This errs towards dropping: a video we cannot tie to the product is removed rather
 * than published under an invented title.
 */
function isAboutProduct(productName: string, brand: string, realTitle: string): boolean {
  const brandWords = new Set(words(brand));
  const tokens = words(productName).filter((t) => t && !GENERIC.has(t) && !brandWords.has(t));
  const squashedTitle = squash(realTitle);
  if (tokens.length === 0) return squashedTitle.includes(squash(brand));
  const hits = tokens.filter((t) => squashedTitle.includes(t)).length;
  return hits / tokens.length >= 0.5;
}

type Probe =
  | { state: "ok"; title: string; channel: string }
  | { state: "missing" }
  | { state: "unknown" };

/** 404 means the video is really gone. 429/5xx/timeout means YouTube simply did not answer. */
async function probe(id: string): Promise<Probe> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(id)}&format=json`,
        { signal: AbortSignal.timeout(10_000) }
      );
      if (res.ok) {
        const body = (await res.json()) as { title: string; author_name: string };
        return { state: "ok", title: body.title, channel: body.author_name };
      }
      // YouTube answers 404 for a video that does not exist and 401 for one that
      // exists but forbids embedding — neither is a transport failure.
      if (res.status === 404 || res.status === 400) return { state: "missing" };
      if (res.status === 401 || res.status === 403) return { state: "unknown" };
    } catch {
      /* fall through to backoff */
    }
    await sleep(500 * 2 ** attempt);
  }
  return { state: "unknown" };
}

/**
 * VideoObject.uploadDate must be the real publication date, never build time. Only the
 * watch page carries it, and that endpoint throttles aggressively, so this is
 * best-effort: an unknown date drops the field rather than inventing one.
 */
async function uploadDate(id: string): Promise<string | undefined> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        const match = (await res.text()).match(/itemprop="datePublished" content="([^"]+)"/);
        if (match) return match[1].slice(0, 10);
        return undefined;
      }
    } catch {
      /* fall through to backoff */
    }
    await sleep(1_500 * 2 ** attempt);
  }
  return undefined;
}

async function check(
  v: { id: string; title: string },
  product: { name: string; brand: string; slug: string }
): Promise<Checked> {
  const base = { videoId: v.id, product: product.name, slug: product.slug, stored: v.title };
  const found = await probe(v.id);
  if (found.state === "unknown") return { ...base, verdict: "unresolved" };
  if (found.state === "missing") return { ...base, verdict: "dead" };
  if (!isAboutProduct(product.name, product.brand, found.title)) {
    return { ...base, verdict: "off-product", realTitle: found.title, channel: found.channel };
  }
  return { ...base, verdict: "verified", realTitle: found.title, channel: found.channel };
}

const products = getAllProducts();
const queue = products.flatMap((p) =>
  (p.youtubeVideos ?? []).map((v) => ({ v, p: { name: p.name, brand: p.brand, slug: p.slug } }))
);

const results: Checked[] = [];
for (let i = 0; i < queue.length; i += 8) {
  const batch = queue.slice(i, i + 8);
  results.push(...(await Promise.all(batch.map(({ v, p }) => check(v, p)))));
  process.stdout.write(`\rchecked ${Math.min(i + 8, queue.length)}/${queue.length}`);
}
console.log("");

const by = (verdict: Verdict) => results.filter((r) => r.verdict === verdict);
const verified = by("verified");
const dead = by("dead");
const off = by("off-product");
const unresolved = by("unresolved");

console.log(`\nproducts=${products.length} videos=${results.length}`);
console.log(`  verified    ${verified.length}`);
console.log(`  off-product ${off.length}  (real video, but about another product)`);
console.log(`  dead        ${dead.length}  (YouTube returns 404 — the ID does not exist)`);
console.log(`  unresolved  ${unresolved.length}  (YouTube did not answer)`);

const retitled = verified.filter((r) => r.stored !== r.realTitle);
console.log(
  `\nof the ${verified.length} verified, ${retitled.length} carried a stored title that is not the real YouTube title`
);
if (off.length) {
  console.log("\nOFF-PRODUCT (dropped):");
  off.forEach((r) =>
    console.log(`  ${r.slug}\n     stored: "${r.stored}"\n     actual: "${r.realTitle}" [${r.channel}]`)
  );
}

if (unresolved.length) {
  console.error(
    `\nRefusing to continue: ${unresolved.length} videos could not be resolved (YouTube is likely rate-limiting).` +
      `\nA video that YouTube declined to answer for is NOT proof the video is gone, and treating it as` +
      `\ndead would delete real data. Re-run when the rate limit clears.`
  );
  process.exit(1);
}

if (!WRITE) {
  console.log("\n(report only — pass --write to apply)");
  process.exit(0);
}

// uploadDate is fetched only for survivors, sequentially, because the watch page
// throttles far harder than oembed. A missing date is not fatal — the field is simply
// omitted downstream rather than fabricated.
for (const [i, v] of verified.entries()) {
  v.uploadDate = await uploadDate(v.videoId);
  process.stdout.write(`\rdates ${i + 1}/${verified.length}`);
  await sleep(400);
}
console.log("");
const undated = verified.filter((v) => !v.uploadDate).length;
if (undated) console.log(`${undated}/${verified.length} kept without an uploadDate (field omitted, never invented)`);

// The same video ID is listed under several products (one clip was seeded onto up to
// three product pages, each with its own invented title), so a verdict is only valid
// for the product it was checked against. Key on both.
const keep = new Map(verified.map((r) => [`${r.slug}::${r.videoId}`, r]));
let removed = 0;
let rewritten = 0;

for (const file of DATA_FILES) {
  const lines = readFileSync(file, "utf8").split("\n");
  const out: string[] = [];
  let slug = "";
  for (const line of lines) {
    // Product fields sit at exactly four spaces; nested objects are deeper, so this
    // only ever picks up the product's own slug.
    const productSlug = line.match(/^ {4}slug:\s*"([^"]+)"/);
    if (productSlug) slug = productSlug[1];

    const entry = line.match(/^(\s*)\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"[\s\S]*"\s*\},?\s*$/);
    if (!entry) {
      out.push(line);
      continue;
    }
    const [, indent, id] = entry;
    const win = keep.get(`${slug}::${id}`);
    if (!win) {
      removed++;
      continue;
    }
    const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    // The watch page throttles far harder than oembed, so an unresolved date means
    // "YouTube did not answer", not "this video has no date" — and a video's upload
    // date never changes once known. Keep the date an earlier run already confirmed
    // instead of stripping it, or every throttled run (this is scheduled weekly now)
    // would quietly delete real metadata and open a PR proposing exactly that.
    const priorDate = line.match(/uploadDate:\s*"([^"]+)"/)?.[1];
    const resolvedDate = win.uploadDate ?? priorDate;
    const date = resolvedDate ? `, uploadDate: "${resolvedDate}"` : "";
    out.push(
      `${indent}{ id: "${id}", title: "${esc(win.realTitle!)}", channel: "${esc(win.channel!)}"${date} },`
    );
    rewritten++;
  }
  writeFileSync(file, out.join("\n"));
}

console.log(`\nwrote ${DATA_FILES.length} files: kept ${rewritten} verified videos, removed ${removed} unverifiable entries`);
