/**
 * IndexNow integration for ReviewIQ.
 *
 * IndexNow lets us proactively notify search engines (Bing, Yandex, Seznam,
 * and — via the shared IndexNow network — Google's crawl scheduling) that URLs
 * have changed, so newly-added structured data (Review / AggregateRating star
 * ratings) gets re-crawled promptly instead of waiting for the next organic
 * crawl.
 *
 * Setup:
 *   1. Set INDEXNOW_KEY in the environment to a random hex string (8–128 chars).
 *   2. The key is served for verification at the site root `/indexnow-key.txt`
 *      (see app/indexnow-key.txt/route.ts). This matches the `keyLocation` sent
 *      in every submission, so the receiving engine can confirm ownership. It
 *      MUST be root-level: IndexNow only authorizes URLs at or below the key
 *      file's directory, so a subfolder key can't index the whole site.
 *   3. Submit URLs via `submitAllProductReviewUrls()` (see scripts/submit-indexnow.ts).
 */
import { products } from "@/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

/** Public IndexNow endpoint. Any participating engine forwards to the others. */
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** IndexNow accepts at most 10,000 URLs per request. */
export const MAX_URLS_PER_REQUEST = 10000;

/**
 * Path (relative to the site root) where the ownership key is served.
 *
 * MUST be at the site ROOT. IndexNow only authorizes submission of URLs at or
 * below the directory of `keyLocation`, so a key served from a subfolder (e.g.
 * `/api/indexnow/key.txt`) can only submit URLs under that subfolder — whole-
 * site submissions are rejected with HTTP 422. A root-level path authorizes the
 * entire host. See app/indexnow-key.txt/route.ts.
 */
export const KEY_PATH = "/indexnow-key.txt";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Reads and normalizes the IndexNow key from the environment. */
export function getIndexNowKey(): string | undefined {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key ? key : undefined;
}

/** Bare host (no scheme) required by the IndexNow payload `host` field. */
export function getHost(siteUrl: string = SITE_URL): string {
  return new URL(siteUrl).host;
}

/** Absolute URL where the ownership key is hosted for verification. */
export function getKeyLocation(siteUrl: string = SITE_URL): string {
  return `${trimTrailingSlash(siteUrl)}${KEY_PATH}`;
}

/**
 * All product/review detail URLs eligible for Review/AggregateRating rich
 * results. These are the pages whose structured data this ticket touches.
 */
export function getProductReviewUrls(siteUrl: string = SITE_URL): string[] {
  const base = trimTrailingSlash(siteUrl);
  return products.map((p) => `${base}/category/${p.categorySlug}/${p.slug}`);
}

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/** Builds a single IndexNow request payload. */
export function buildPayload(
  urls: string[],
  key: string,
  siteUrl: string = SITE_URL
): IndexNowPayload {
  return {
    host: getHost(siteUrl),
    key,
    keyLocation: getKeyLocation(siteUrl),
    urlList: urls,
  };
}

export interface SubmitOptions {
  /** Override the IndexNow key (defaults to INDEXNOW_KEY env var). */
  key?: string;
  /** Override the site URL (defaults to NEXT_PUBLIC_SITE_URL). */
  siteUrl?: string;
  /** Injectable fetch, primarily for testing. */
  fetch?: typeof fetch;
}

export interface IndexNowResult {
  ok: boolean;
  /** True when no request was sent (no key, or no URLs). */
  skipped?: boolean;
  reason?: string;
  status?: number;
  submitted: number;
  batches: number;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Submits a list of URLs to IndexNow. Deduplicates, drops empties, and chunks
 * into batches of {@link MAX_URLS_PER_REQUEST}. Fails gracefully (never throws
 * on a missing key or empty list) so callers can invoke it unconditionally.
 */
export async function submitToIndexNow(
  urls: string[],
  opts: SubmitOptions = {}
): Promise<IndexNowResult> {
  const key = opts.key ?? getIndexNowKey();
  const siteUrl = opts.siteUrl ?? SITE_URL;
  const fetchImpl = opts.fetch ?? fetch;

  const deduped = Array.from(new Set(urls.filter((u) => Boolean(u && u.trim()))));

  if (deduped.length === 0) {
    return { ok: true, skipped: true, reason: "no-urls", submitted: 0, batches: 0 };
  }
  if (!key) {
    return { ok: false, skipped: true, reason: "missing-key", submitted: 0, batches: 0 };
  }

  const batches = chunk(deduped, MAX_URLS_PER_REQUEST);
  let submitted = 0;

  for (const batch of batches) {
    const res = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(buildPayload(batch, key, siteUrl)),
    });

    // IndexNow returns 200 (accepted) or 202 (accepted, pending validation).
    if (!(res.status === 200 || res.status === 202)) {
      return {
        ok: false,
        status: res.status,
        reason: `http-${res.status}`,
        submitted,
        batches: batches.length,
      };
    }
    submitted += batch.length;
  }

  return { ok: true, status: 200, submitted, batches: batches.length };
}

/** Convenience: submit every product/review page URL. */
export function submitAllProductReviewUrls(
  opts: SubmitOptions = {}
): Promise<IndexNowResult> {
  return submitToIndexNow(getProductReviewUrls(opts.siteUrl), opts);
}
