#!/usr/bin/env node
/**
 * audit-jsonld-fields.mjs — LIVE-PROD field-level JSON-LD validity sweep.
 *
 * Prior sweeps proved a page-level @type EXISTS. This one proves the node's
 * REQUIRED properties are present and well-formed, i.e. that Google will
 * actually mint the rich result instead of silently dropping it.
 *
 * Usage: node audit-jsonld-fields.mjs [--limit N] [--selftest]
 */

// .trim() per DAN-945 — a trailing newline in the Vercel env var silently breaks every URL join
const SITE = (process.env.AUDIT_SITE_URL || 'https://www.revieweriq.com').trim().replace(/\/$/, '');
const CONCURRENCY = 8;

const args = process.argv.slice(2);
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;
const SELFTEST = args.includes('--selftest');

// ---------------------------------------------------------------- validators

const isNonEmptyStr = (v) => typeof v === 'string' && v.trim().length > 0;
const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const typesOf = (n) => asArray(n?.['@type']).filter(isNonEmptyStr);

/** absolute https URL on the canonical www host */
function urlIssue(field, v) {
  if (v == null) return null;
  const raw = typeof v === 'string' ? v : v?.['@id'] ?? v?.url;
  if (!isNonEmptyStr(raw)) return `${field}: not a string URL`;
  if (raw.startsWith('/')) return `${field}: relative URL (${raw})`;
  let u;
  try { u = new URL(raw); } catch { return `${field}: unparseable URL (${raw})`; }
  if (u.protocol !== 'https:') return `${field}: not https (${raw})`;
  if (u.hostname === 'revieweriq.com') return `${field}: non-www host (${raw})`;
  return null;
}

function checkAggregateRating(ar, path, out) {
  const rv = ar.ratingValue;
  const num = typeof rv === 'string' ? Number(rv) : rv;
  if (rv == null || Number.isNaN(num)) out.push(`${path}.ratingValue missing/non-numeric (${JSON.stringify(rv)})`);
  else {
    const best = Number(ar.bestRating ?? 5);
    const worst = Number(ar.worstRating ?? 1);
    if (num > best || num < worst) out.push(`${path}.ratingValue ${num} outside [${worst},${best}]`);
  }
  const count = ar.reviewCount ?? ar.ratingCount;
  const cnum = typeof count === 'string' ? Number(count) : count;
  if (count == null) out.push(`${path} missing reviewCount/ratingCount`);
  else if (Number.isNaN(cnum) || cnum < 1) out.push(`${path} reviewCount/ratingCount invalid (${JSON.stringify(count)})`);
}

function checkReview(r, path, out) {
  const a = r.author;
  const aName = typeof a === 'string' ? a : a?.name;
  if (!isNonEmptyStr(aName)) out.push(`${path}.author missing/empty name`);
  const rr = r.reviewRating;
  if (!rr) out.push(`${path}.reviewRating missing`);
  else {
    const num = Number(rr.ratingValue);
    if (rr.ratingValue == null || Number.isNaN(num)) out.push(`${path}.reviewRating.ratingValue missing/non-numeric`);
    else {
      const best = Number(rr.bestRating ?? 5);
      if (num > best || num < Number(rr.worstRating ?? 1)) out.push(`${path}.reviewRating.ratingValue ${num} out of range`);
    }
  }
}

/** returns array of human-readable defect strings for ONE node */
function validateNode(node, path) {
  const out = [];
  if (!node || typeof node !== 'object') return out;
  const types = typesOf(node);
  if (types.length === 0) { out.push(`${path} has no @type`); return out; }
  const t = new Set(types);
  const p = `${path}[${types.join('+')}]`;

  // universal: any url-ish property must be absolute https www
  for (const f of ['url', 'contentUrl', 'thumbnailUrl', 'logo', 'image', 'sameAs']) {
    for (const v of asArray(node[f])) {
      const i = urlIssue(`${p}.${f}`, v);
      if (i) out.push(i);
    }
  }

  if (t.has('Product')) {
    if (!isNonEmptyStr(node.name)) out.push(`${p}.name missing`);
    if (node.offers) {
      for (const o of asArray(node.offers)) {
        if (typesOf(o).includes('AggregateOffer')) {
          if (o.lowPrice == null) out.push(`${p}.offers.lowPrice missing`);
        } else if (o.price == null && o.priceSpecification == null) {
          out.push(`${p}.offers.price missing`);
        }
        if (!isNonEmptyStr(o.priceCurrency) && !o.priceSpecification) out.push(`${p}.offers.priceCurrency missing`);
      }
    }
    if (node.aggregateRating) checkAggregateRating(node.aggregateRating, `${p}.aggregateRating`, out);
    asArray(node.review).forEach((r, i) => checkReview(r, `${p}.review[${i}]`, out));
  }

  if (t.has('Review')) {
    checkReview(node, p, out);
    if (!node.itemReviewed) out.push(`${p}.itemReviewed missing`);
  }

  if (t.has('AggregateRating')) checkAggregateRating(node, p, out);

  if (t.has('BreadcrumbList')) {
    const items = asArray(node.itemListElement);
    if (items.length === 0) out.push(`${p}.itemListElement empty`);
    const positions = [];
    items.forEach((li, i) => {
      const pos = Number(li.position);
      if (Number.isNaN(pos)) out.push(`${p}.itemListElement[${i}].position missing/non-numeric`);
      else positions.push(pos);
      if (!isNonEmptyStr(li.name) && !isNonEmptyStr(li.item?.name)) out.push(`${p}.itemListElement[${i}].name missing`);
      // final crumb may omit item
      if (i < items.length - 1) {
        if (li.item == null) out.push(`${p}.itemListElement[${i}].item missing (non-final crumb)`);
        else {
          const iss = urlIssue(`${p}.itemListElement[${i}].item`, li.item);
          if (iss) out.push(iss);
        }
      }
    });
    const sorted = [...positions].sort((a, b) => a - b);
    const expected = positions.map((_, i) => i + 1);
    if (positions.length && (JSON.stringify(sorted) !== JSON.stringify(expected)))
      out.push(`${p} positions not 1..n contiguous (got ${positions.join(',')})`);
    if (positions.length && JSON.stringify(positions) !== JSON.stringify(sorted))
      out.push(`${p} positions out of document order (got ${positions.join(',')})`);
  }

  if (t.has('ItemList')) {
    const items = asArray(node.itemListElement);
    if (items.length === 0) out.push(`${p}.itemListElement empty`);
    const positions = items.map((li) => Number(li.position)).filter((n) => !Number.isNaN(n));
    if (positions.length !== items.length) out.push(`${p} some itemListElement.position missing/non-numeric`);
    const sorted = [...positions].sort((a, b) => a - b);
    if (JSON.stringify(positions) !== JSON.stringify(sorted))
      out.push(`${p} positions out of document order (got ${positions.slice(0, 12).join(',')})`);
  }

  if (t.has('FAQPage')) {
    const qs = asArray(node.mainEntity);
    if (qs.length === 0) out.push(`${p}.mainEntity empty`);
    qs.forEach((q, i) => {
      if (!isNonEmptyStr(q.name)) out.push(`${p}.mainEntity[${i}].name missing`);
      const ans = q.acceptedAnswer;
      if (!ans) out.push(`${p}.mainEntity[${i}].acceptedAnswer missing`);
      else if (!isNonEmptyStr(ans.text)) out.push(`${p}.mainEntity[${i}].acceptedAnswer.text missing/empty`);
    });
  }

  if (t.has('Article') || t.has('BlogPosting') || t.has('NewsArticle')) {
    if (!isNonEmptyStr(node.headline)) out.push(`${p}.headline missing`);
    else if (node.headline.length > 110) out.push(`${p}.headline ${node.headline.length} chars (>110, Google truncates)`);
    if (!node.image) out.push(`${p}.image missing`);
    if (!isNonEmptyStr(node.datePublished)) out.push(`${p}.datePublished missing`);
    const auth = asArray(node.author);
    if (auth.length === 0 || !auth.some((a) => isNonEmptyStr(typeof a === 'string' ? a : a?.name)))
      out.push(`${p}.author missing/unnamed`);
    for (const f of ['datePublished', 'dateModified']) {
      if (node[f] != null && Number.isNaN(Date.parse(node[f]))) out.push(`${p}.${f} unparseable (${node[f]})`);
    }
  }

  if (t.has('VideoObject')) {
    for (const f of ['name', 'description', 'thumbnailUrl', 'uploadDate']) {
      if (!node[f]) out.push(`${p}.${f} missing`);
    }
    if (node.uploadDate && Number.isNaN(Date.parse(node.uploadDate))) out.push(`${p}.uploadDate unparseable`);
  }

  if (t.has('Organization') || t.has('WebSite')) {
    if (!isNonEmptyStr(node.name)) out.push(`${p}.name missing`);
    if (!node.url) out.push(`${p}.url missing`);
  }

  if (t.has('DiscussionForumPosting')) {
    if (!isNonEmptyStr(node.headline) && !isNonEmptyStr(node.name)) out.push(`${p} missing headline/name`);
    if (!node.datePublished) out.push(`${p}.datePublished missing`);
    const auth = node.author;
    if (!isNonEmptyStr(typeof auth === 'string' ? auth : auth?.name)) out.push(`${p}.author missing/unnamed`);
  }

  return out;
}

/** walk every node reachable from a parsed JSON-LD payload */
function collectNodes(payload) {
  const nodes = [];
  const walk = (v, path) => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`));
    if (!v || typeof v !== 'object') return;
    if (v['@graph']) return asArray(v['@graph']).forEach((x, i) => walk(x, `${path}@graph[${i}]`));
    if (v['@type']) nodes.push([v, path]);
  };
  walk(payload, '');
  return nodes;
}

// -------------------------------------------------------------------- runner

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'reviewiq-jsonld-audit' } });
  return { status: res.status, html: await res.text(), finalUrl: res.url };
}

const LD_RE = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

async function auditUrl(url) {
  const defects = [];
  let status = 0;
  try {
    const r = await fetchText(url);
    status = r.status;
    if (r.status !== 200) return { url, status, defects: [`HTTP ${r.status}`], blocks: 0 };
    const raws = [...r.html.matchAll(LD_RE)].map((m) => m[1]);
    if (raws.length === 0) return { url, status, defects: ['no JSON-LD block'], blocks: 0 };
    let nodeCount = 0;
    const seenTypes = [];
    raws.forEach((raw, bi) => {
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch (e) { defects.push(`block[${bi}] UNPARSEABLE JSON: ${e.message}`); return; }
      for (const [node, path] of collectNodes(parsed)) {
        nodeCount++;
        seenTypes.push(...typesOf(node));
        defects.push(...validateNode(node, `block[${bi}]${path}`));
      }
    });
    if (nodeCount === 0) defects.push('JSON-LD present but ZERO nodes reachable (vacuous)');
    return { url, status, defects, blocks: raws.length, nodeCount, seenTypes };
  } catch (e) {
    return { url, status, defects: [`FETCH ERROR: ${e.message}`], blocks: 0 };
  }
}

async function pool(items, n, fn) {
  const results = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }));
  return results;
}

// ---------------------------------------------------------------- self-test

function selftest() {
  const cases = [
    ['Product missing offers.price', { '@type': 'Product', name: 'X', offers: { '@type': 'Offer', priceCurrency: 'USD' } }, /offers.price missing/],
    ['aggregateRating ratingValue 9 of 5', { '@type': 'Product', name: 'X', aggregateRating: { ratingValue: 9, reviewCount: 3 } }, /outside \[1,5\]/],
    ['aggregateRating reviewCount 0', { '@type': 'Product', name: 'X', aggregateRating: { ratingValue: 4, reviewCount: 0 } }, /reviewCount\/ratingCount invalid/],
    ['breadcrumb off-by-one positions', { '@type': 'BreadcrumbList', itemListElement: [{ position: 2, name: 'A', item: 'https://www.revieweriq.com/a' }, { position: 3, name: 'B' }] }, /not 1\.\.n contiguous/],
    ['breadcrumb non-www item', { '@type': 'BreadcrumbList', itemListElement: [{ position: 1, name: 'A', item: 'https://revieweriq.com/a' }, { position: 2, name: 'B' }] }, /non-www host/],
    ['FAQ empty answer', { '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: '' } }] }, /acceptedAnswer.text missing\/empty/],
    ['Article headline 120ch', { '@type': 'Article', headline: 'x'.repeat(120), image: 'https://www.revieweriq.com/i.png', datePublished: '2026-01-01', author: { name: 'A' } }, />110/],
    ['Article unnamed author', { '@type': 'Article', headline: 'H', image: 'https://www.revieweriq.com/i.png', datePublished: '2026-01-01', author: {} }, /author missing\/unnamed/],
    ['ItemList out of order', { '@type': 'ItemList', itemListElement: [{ position: 2 }, { position: 1 }] }, /out of document order/],
    ['VideoObject no thumbnail', { '@type': 'VideoObject', name: 'V', description: 'd', uploadDate: '2026-01-01' }, /thumbnailUrl missing/],
    ['Review no author', { '@type': 'Review', itemReviewed: { '@type': 'Product', name: 'P' }, reviewRating: { ratingValue: 5 } }, /author missing\/empty name/],
  ];
  let pass = 0;
  for (const [label, node, re] of cases) {
    const d = validateNode(node, 'test');
    const hit = d.some((x) => re.test(x));
    console.log(`  ${hit ? 'PASS' : 'FAIL'}  ${label}${hit ? '' : ` -> got ${JSON.stringify(d)}`}`);
    if (hit) pass++;
  }
  // positive control: a fully valid node must yield ZERO defects
  const good = { '@type': 'Product', name: 'X', offers: { '@type': 'Offer', price: '19.99', priceCurrency: 'USD' }, aggregateRating: { ratingValue: 4.3, reviewCount: 12 } };
  const gd = validateNode(good, 'test');
  console.log(`  ${gd.length === 0 ? 'PASS' : 'FAIL'}  valid Product yields no defects${gd.length ? ` -> ${JSON.stringify(gd)}` : ''}`);
  if (gd.length === 0) pass++;
  console.log(`\nself-test ${pass}/${cases.length + 1}`);
  return pass === cases.length + 1;
}

// -------------------------------------------------------------------- main

(async () => {
  console.log('=== NEGATIVE / POSITIVE CONTROL ===');
  const ok = selftest();
  if (!ok) { console.error('validator self-test FAILED — sweep results would not be trustworthy'); process.exit(2); }
  if (SELFTEST) return;

  const sm = await fetchText(`${SITE}/sitemap.xml`);
  let urls = [...sm.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  console.log(`\nsitemap: ${urls.length} URLs`);
  urls = urls.slice(0, LIMIT);

  const t0 = Date.now();
  const results = await pool(urls, CONCURRENCY, auditUrl);
  const bad = results.filter((r) => r.defects.length > 0);

  console.log(`\n=== SWEPT ${results.length} URLs in ${Math.round((Date.now() - t0) / 1000)}s ===`);
  console.log(`clean: ${results.length - bad.length}   with defects: ${bad.length}`);

  // COVERAGE CONTROL — a clean result is only meaningful if nodes were actually validated
  const hist = new Map();
  let totalNodes = 0;
  for (const r of results) {
    totalNodes += r.nodeCount || 0;
    for (const t of r.seenTypes || []) hist.set(t, (hist.get(t) || 0) + 1);
  }
  console.log(`\n=== COVERAGE CONTROL: ${totalNodes} nodes validated across ${results.length} URLs ===`);
  for (const [t, n] of [...hist.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(5)}  ${t}`);
  const zero = results.filter((r) => (r.nodeCount || 0) === 0);
  if (zero.length) console.log(`  !! ${zero.length} URLs contributed ZERO nodes: ${zero.slice(0, 5).map((r) => r.url).join(', ')}`);

  // group by defect signature so the report is actionable, not 348 lines
  const byClass = new Map();
  for (const r of bad) {
    for (const d of r.defects) {
      const sig = d.replace(/\[\d+\]/g, '[i]').replace(/\(.*\)/, '(...)').replace(/^block\[i\]\S*?\[/, '[');
      if (!byClass.has(sig)) byClass.set(sig, []);
      byClass.get(sig).push(r.url);
    }
  }
  console.log(`\n=== ${byClass.size} DEFECT CLASSES ===`);
  for (const [sig, us] of [...byClass.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n[${us.length} URLs] ${sig}`);
    us.slice(0, 4).forEach((u) => console.log(`   ${u}`));
    if (us.length > 4) console.log(`   ... +${us.length - 4} more`);
  }
  if (byClass.size === 0) console.log('\nNo field-level JSON-LD defects found.');
})();
