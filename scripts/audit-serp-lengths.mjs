/**
 * SERP length audit: crawls every URL in the sitemap and reports which pages
 * ship a <title> or <meta name="description"> that Google will truncate.
 *
 *   node scripts/audit-serp-lengths.mjs                      # prod
 *   node scripts/audit-serp-lengths.mjs http://localhost:3999 # local dev server
 *
 * Google renders ~600px of the title (~60 chars) and ~160 chars of the
 * description. Anything past that is replaced with an ellipsis, so the
 * click-driving tail of the snippet never reaches the searcher.
 */
const BASE = (process.argv[2] || "https://www.revieweriq.com").replace(/\/$/, "");
const TITLE_MAX = 60;
const DESC_MAX = 160;
const CONCURRENCY = 8;

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");

function section(path) {
  if (path === "/") return "home";
  if (path.startsWith("/compare/")) return "compare/[slug]";
  if (path === "/compare") return "compare hub";
  if (path.startsWith("/community/thread/")) return "community thread";
  if (path.startsWith("/community/user/")) return "community profile";
  if (path.startsWith("/blog/category/")) return "blog category";
  if (path.startsWith("/blog/")) return "blog post";
  if (path.startsWith("/faq/")) return "faq page";
  if (/^\/category\/[^/]+\/[^/]+\/where-to-buy$/.test(path)) return "where-to-buy";
  if (/^\/category\/[^/]+\/[^/]+$/.test(path)) return "product page";
  if (/^\/category\/[^/]+$/.test(path)) return "category hub";
  return "misc";
}

async function main() {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`Crawling ${urls.length} URLs from ${BASE}/sitemap.xml\n`);

  const rows = [];
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const url = queue.shift();
        const path = new URL(url).pathname;
        try {
          const html = await (await fetch(url, { headers: { "user-agent": "Googlebot" } })).text();
          const title = decode((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "");
          const desc = decode(
            (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || "",
          );
          rows.push({ path, section: section(path), title, desc });
        } catch (e) {
          rows.push({ path, section: section(path), title: "", desc: "", error: String(e) });
        }
      }
    }),
  );

  const longT = rows.filter((r) => r.title.length > TITLE_MAX);
  const longD = rows.filter((r) => r.desc.length > DESC_MAX);
  const doubleBrand = rows.filter((r) => (r.title.match(/ReviewIQ/g) || []).length > 1);

  const bySection = {};
  for (const r of rows) {
    const s = (bySection[r.section] ||= { pages: 0, longT: 0, longD: 0, maxT: 0, maxD: 0 });
    s.pages++;
    if (r.title.length > TITLE_MAX) s.longT++;
    if (r.desc.length > DESC_MAX) s.longD++;
    s.maxT = Math.max(s.maxT, r.title.length);
    s.maxD = Math.max(s.maxD, r.desc.length);
  }

  console.log("section              pages  title>60  maxT  desc>160  maxD");
  for (const [name, s] of Object.entries(bySection).sort()) {
    console.log(
      `${name.padEnd(20)} ${String(s.pages).padStart(5)}  ${String(s.longT).padStart(8)}  ${String(
        s.maxT,
      ).padStart(4)}  ${String(s.longD).padStart(8)}  ${String(s.maxD).padStart(4)}`,
    );
  }

  console.log(
    `\nTOTAL: ${longT.length}/${rows.length} titles > ${TITLE_MAX}ch, ` +
      `${longD.length}/${rows.length} descriptions > ${DESC_MAX}ch, ` +
      `${doubleBrand.length} double-branded titles`,
  );

  const worst = [...rows].sort((a, b) => b.title.length - a.title.length).slice(0, 5);
  console.log("\nWorst titles:");
  for (const r of worst) console.log(`  ${String(r.title.length).padStart(3)}  ${r.title}`);

  if (doubleBrand.length) {
    console.log("\nDouble-branded:");
    for (const r of doubleBrand.slice(0, 3)) console.log(`  ${r.title}`);
  }

  process.exitCode = longT.length || longD.length || doubleBrand.length ? 1 : 0;
}

main();
