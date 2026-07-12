#!/usr/bin/env node
/**
 * Crawls every sitemap URL as Googlebot and reports structural on-page SEO signals:
 * h1 count, internal links, canonical, robots, JSON-LD @types, image alt coverage, word count.
 *
 *   node scripts/audit-onpage.mjs                        # prod
 *   node scripts/audit-onpage.mjs http://localhost:3999  # local `next start`
 */

const BASE = process.argv[2]?.replace(/\/$/, '') || 'https://www.revieweriq.com';
const UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const CONCURRENCY = 8;

const get = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  return { status: res.status, html: await res.text() };
};

const section = (path) => {
  if (path === '/') return 'home';
  if (path === '/compare') return 'compare hub';
  if (path.startsWith('/compare/')) return 'compare/[slug]';
  if (path.startsWith('/product/')) return 'product page';
  if (path.startsWith('/where-to-buy/')) return 'where-to-buy';
  if (path.startsWith('/blog/category/')) return 'blog category';
  if (path.startsWith('/blog/')) return 'blog post';
  if (path.startsWith('/community/thread/')) return 'community thread';
  if (path.startsWith('/community/user/')) return 'community profile';
  if (path.startsWith('/category/')) return 'category hub';
  if (path.startsWith('/faq')) return 'faq page';
  return 'misc';
};

const analyze = (html, path) => {
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim(),
  );
  const canonical = html.match(
    /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
  )?.[1];
  const robots = html.match(
    /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i,
  )?.[1];

  // internal <a href> to on-site paths, excluding the page itself
  const links = new Set();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#?]+)/gi)) {
    const h = m[1];
    if (h.startsWith('/') && h !== path) links.add(h.replace(/\/$/, '') || '/');
  }

  const ldTypes = [];
  for (const m of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === 'object') {
          if (n['@type']) ldTypes.push(...[n['@type']].flat());
          if (n['@graph']) walk(n['@graph']);
        }
      };
      walk(parsed);
    } catch {
      ldTypes.push('!INVALID_JSON');
    }
  }

  // <img> alt coverage (Next/Image renders real <img> in SSR HTML)
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const altMissing = imgs.filter((t) => !/\balt=/i.test(t)).length;
  const altEmpty = imgs.filter((t) => /\balt=["']\s*["']/i.test(t)).length;

  // visible word count: strip script/style/svg then tags
  const text = html
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ');
  const words = text.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;

  return {
    h1s,
    canonical,
    robots,
    links: links.size,
    ldTypes: [...new Set(ldTypes)],
    imgs: imgs.length,
    altMissing,
    altEmpty,
    words,
  };
};

const sitemapXml = (await get(`${BASE}/sitemap.xml`)).html;
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`Crawling ${urls.length} URLs from ${BASE}/sitemap.xml\n`);

const rows = [];
let i = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (i < urls.length) {
      const url = urls[i++];
      const path = new URL(url).pathname;
      try {
        const { status, html } = await get(url);
        rows.push({ path, section: section(path), status, ...analyze(html, path) });
      } catch (e) {
        rows.push({ path, section: section(path), status: 0, error: String(e) });
      }
    }
  }),
);
rows.sort((a, b) => a.path.localeCompare(b.path));

const bySection = {};
for (const r of rows) (bySection[r.section] ||= []).push(r);

const pad = (s, n) => String(s).padEnd(n);
console.log(
  pad('section', 20) +
    pad('pages', 6) +
    pad('non200', 7) +
    pad('h1!=1', 7) +
    pad('minLinks', 9) +
    pad('noCanon', 8) +
    pad('noindex', 8) +
    pad('noLD', 6) +
    pad('altGap', 7) +
    pad('minWords', 8),
);
for (const [s, rs] of Object.entries(bySection).sort()) {
  console.log(
    pad(s, 20) +
      pad(rs.length, 6) +
      pad(rs.filter((r) => r.status !== 200).length, 7) +
      pad(rs.filter((r) => (r.h1s?.length ?? 0) !== 1).length, 7) +
      pad(Math.min(...rs.map((r) => r.links ?? 0)), 9) +
      pad(rs.filter((r) => !r.canonical).length, 8) +
      pad(rs.filter((r) => /noindex/i.test(r.robots || '')).length, 8) +
      pad(rs.filter((r) => !r.ldTypes?.length).length, 6) +
      pad(
        rs.reduce((n, r) => n + (r.altMissing ?? 0) + (r.altEmpty ?? 0), 0),
        7,
      ) +
      pad(Math.min(...rs.map((r) => r.words ?? 0)), 8),
  );
}

const flag = (label, pred, fmt = (r) => r.path) => {
  const hits = rows.filter(pred);
  if (!hits.length) return;
  console.log(`\n${label} (${hits.length}):`);
  hits.slice(0, 12).forEach((r) => console.log('  ' + fmt(r)));
  if (hits.length > 12) console.log(`  … and ${hits.length - 12} more`);
};

flag('NON-200', (r) => r.status !== 200, (r) => `${r.status}  ${r.path}`);
flag('H1 != 1', (r) => (r.h1s?.length ?? 0) !== 1, (r) => `${r.h1s?.length} h1  ${r.path}`);
flag('NO CANONICAL', (r) => r.status === 200 && !r.canonical);
flag('NOINDEX but in sitemap', (r) => /noindex/i.test(r.robots || ''));
flag('NO JSON-LD', (r) => r.status === 200 && !r.ldTypes?.length);
flag('INVALID JSON-LD', (r) => r.ldTypes?.includes('!INVALID_JSON'));
flag(
  'IMG ALT GAP',
  (r) => (r.altMissing ?? 0) + (r.altEmpty ?? 0) > 0,
  (r) => `${r.altMissing} missing / ${r.altEmpty} empty of ${r.imgs}  ${r.path}`,
);
flag('THIN (<300 words)', (r) => r.status === 200 && (r.words ?? 999) < 300, (r) => `${r.words}w  ${r.path}`);
flag('CRAWL DEAD-END (<5 internal links)', (r) => r.status === 200 && (r.links ?? 99) < 5, (r) => `${r.links} links  ${r.path}`);

console.log('\nJSON-LD @type coverage by section:');
for (const [s, rs] of Object.entries(bySection).sort()) {
  const counts = {};
  rs.forEach((r) => (r.ldTypes || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  console.log(
    `  ${pad(s, 20)} ${Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => `${t}:${n}`)
      .join(' ') || '—'}`,
  );
}
