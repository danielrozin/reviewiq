#!/usr/bin/env node
/**
 * Builds the internal link graph from every sitemap URL and reports:
 *   1. BROKEN  — internal <a href> targets that do not return 200
 *   2. ORPHANS — sitemap URLs with zero inbound internal links (crawl dead-ends)
 *
 * Companion to audit-onpage.mjs, which measures each page in isolation and so
 * cannot see either class: a page can be perfectly marked up and still be linked
 * to a 404, or be linked from nowhere.
 *
 *   node scripts/audit-links.mjs                        # prod
 *   node scripts/audit-links.mjs http://localhost:4123  # local `next start`
 */
const BASE = (process.argv[2] || 'https://www.revieweriq.com').replace(/\/$/, '');
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const CONC = 8;

const norm = (href) => {
  if (!href) return null;
  if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return null;
  let u;
  try { u = new URL(href, BASE + '/'); } catch { return null; }
  if (u.origin !== new URL(BASE).origin) return null;
  u.hash = ''; u.search = '';
  let p = u.pathname.replace(/\/+$/, '');
  return p === '' ? '/' : p;
};

const pool = async (items, fn, n = CONC) => {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
};

const sm = await (await fetch(`${BASE}/sitemap.xml`, { headers: { 'User-Agent': UA } })).text();
const sitemap = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => norm(m[1])).filter(Boolean);
console.log(`Sitemap: ${sitemap.length} URLs. Crawling for links...`);

const outbound = new Map(); // page -> Set(target)
await pool(sitemap, async (path) => {
  const res = await fetch(BASE + path, { headers: { 'User-Agent': UA } });
  const html = await res.text();
  // only count links inside <body>, and skip nothing else — nav/footer links are real internal links
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((m) => norm(m[1])).filter(Boolean);
  outbound.set(path, new Set(hrefs));
});

const inbound = new Map(sitemap.map((p) => [p, new Set()]));
const targets = new Set();
for (const [from, tos] of outbound) {
  for (const to of tos) {
    targets.add(to);
    if (inbound.has(to)) inbound.get(to).add(from);
  }
}

const offSitemap = [...targets].filter((t) => !inbound.has(t)).sort();
console.log(`\nUnique internal link targets: ${targets.size} (${offSitemap.length} not in sitemap)\n`);

console.log('Checking status of every link target not in the sitemap...');
const statuses = await pool(offSitemap, async (p) => {
  const r = await fetch(BASE + p, { headers: { 'User-Agent': UA }, redirect: 'manual' });
  return { p, status: r.status, loc: r.headers.get('location') || '' };
});

const broken = statuses.filter((s) => s.status >= 400);
const redirects = statuses.filter((s) => s.status >= 300 && s.status < 400);

console.log(`\n=== BROKEN internal links (${broken.length}) ===`);
for (const b of broken) {
  const srcs = [...outbound].filter(([, tos]) => tos.has(b.p)).map(([f]) => f);
  console.log(`  ${b.status}  ${b.p}   ← linked from ${srcs.length} page(s): ${srcs.slice(0, 4).join(', ')}${srcs.length > 4 ? ' …' : ''}`);
}

console.log(`\n=== REDIRECTING internal links (${redirects.length}) ===`);
for (const r of redirects.slice(0, 20)) {
  const srcs = [...outbound].filter(([, tos]) => tos.has(r.p)).map(([f]) => f);
  console.log(`  ${r.status}  ${r.p} → ${r.loc}   ← from ${srcs.length} page(s)`);
}

const orphans = [...inbound].filter(([, s]) => s.size === 0).map(([p]) => p);
const nearOrphans = [...inbound].filter(([, s]) => s.size === 1).map(([p, s]) => `${p}  ← only ${[...s][0]}`);
console.log(`\n=== ORPHANS: sitemap URLs with ZERO inbound internal links (${orphans.length}) ===`);
orphans.forEach((p) => console.log('  ' + p));
console.log(`\n=== NEAR-ORPHANS: exactly 1 inbound link (${nearOrphans.length}) ===`);
nearOrphans.slice(0, 30).forEach((p) => console.log('  ' + p));

const bySec = {};
for (const [p, s] of inbound) {
  const sec = p === '/' ? 'home'
    : p.startsWith('/compare/') ? 'compare/[slug]'
    : p.startsWith('/blog/category/') ? 'blog category'
    : p.startsWith('/blog/') ? 'blog post'
    : p.startsWith('/community/thread/') ? 'community thread'
    : p.startsWith('/community/user/') ? 'community profile'
    : p.split('/').filter(Boolean).length === 2 && p.startsWith('/category/') ? 'category hub'
    : p.startsWith('/category/') ? 'product page'
    : 'misc';
  (bySec[sec] ||= []).push(s.size);
}
console.log('\n=== inbound-link count by section (min / median / max) ===');
for (const [sec, arr] of Object.entries(bySec)) {
  arr.sort((a, b) => a - b);
  console.log(`  ${sec.padEnd(18)} n=${String(arr.length).padEnd(4)} min=${arr[0]}  med=${arr[Math.floor(arr.length / 2)]}  max=${arr[arr.length - 1]}`);
}
