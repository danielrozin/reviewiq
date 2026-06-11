/**
 * Generate the Phase 1b 301 redirect map (legacy Google Sites path → new
 * ReviewIQ Next.js slug) from the lifted manifest.
 *
 * DAN-942. Writes redirects.json:
 *   - rules:    wildcard Next.js redirect rule objects (imported by next.config.ts)
 *   - explicit: full 1:1 expansion of every legacy URL → destination (QA / cutover)
 *
 * New app route shape (verified against app/ router):
 *   category index  → /category/{slug}
 *   review page     → /category/{slug}/{product}
 *   /about, /blog   → exist 1:1 (no redirect needed)
 *   (there is NO /reviews route → reviews index points at the category hub)
 *
 *   node scripts/build-redirects.mjs
 *
 * Author: Fullstack Developer (SmartReview), DAN-942.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(__dirname, "output", "reviewiq-content.json");
const OUT = path.join(ROOT, "redirects.json");

// Wildcard rules wired into next.config.ts redirects(). Order matters: the
// 2-segment review rule precedes the 1-segment category rule, and the ?usp=
// catch-all is last so legacy content paths keep their SEO-equity-preserving
// 1:1 destination and only bare share-links fall through to "/".
const rules = [
  { source: "/home", destination: "/", permanent: true },
  { source: "/reviews", destination: "/categories", permanent: true },
  { source: "/reviews/:category/:slug", destination: "/category/:category/:slug", permanent: true },
  { source: "/reviews/:category", destination: "/category/:category", permanent: true },
  {
    source: "/:path*",
    has: [{ type: "query", key: "usp" }],
    destination: "/",
    permanent: true,
  },
];

function destFor(p) {
  if (p === "/" || p === "/home") return "/";
  if (p === "/about") return "/about"; // exists 1:1 — no redirect needed
  if (p === "/blog") return "/blog"; // exists 1:1 — no redirect needed
  if (p === "/reviews") return "/categories";
  const m = p.match(/^\/reviews\/([^/]+)(?:\/([^/]+))?$/);
  if (m) return m[2] ? `/category/${m[1]}/${m[2]}` : `/category/${m[1]}`;
  return "/";
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const explicit = manifest.pages.map((pg) => {
    const to = destFor(pg.path);
    return {
      from: pg.path,
      fromUrl: pg.legacyUrl,
      to,
      identity: to === pg.path, // identity = handled by an existing route, no redirect needed
    };
  });
  // Plus the query-variant catch-all, documented explicitly.
  explicit.push({
    from: "/*?usp=<any>",
    fromUrl: `${manifest.legacyPublicBase}/?usp=sharing`,
    to: "/",
    identity: false,
    note: "Google Sites ?usp= share-link query variants → home (single catch-all rule).",
  });

  const out = {
    generatedBy: "scripts/build-redirects.mjs (DAN-942 Phase 1b)",
    generatedFrom: path.relative(ROOT, MANIFEST),
    legacyPublicBase: manifest.legacyPublicBase,
    note: "Applied at cutover (Phase 1d). `rules` are wired into next.config.ts redirects(); `explicit` is the full per-URL verification map.",
    rules,
    explicit,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

  const needRedirect = explicit.filter((e) => !e.identity).length;
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
  console.log(`  rules: ${rules.length}`);
  console.log(`  explicit URLs: ${explicit.length} (${needRedirect} redirected, ${explicit.length - needRedirect} served by existing route)`);
}

main();
