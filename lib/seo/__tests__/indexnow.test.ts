/**
 * Tests for lib/seo/indexnow.ts — IndexNow submission for prompt re-crawl of
 * pages carrying Review / AggregateRating structured data.
 */
import { describe, it, expect, vi } from "vitest";
import {
  INDEXNOW_ENDPOINT,
  KEY_PATH,
  buildPayload,
  getHost,
  getKeyLocation,
  getProductReviewUrls,
  submitToIndexNow,
} from "../indexnow";

const SITE = "https://revieweriq.com";

describe("getHost", () => {
  it("returns the bare host without scheme", () => {
    expect(getHost(SITE)).toBe("revieweriq.com");
  });
});

describe("getKeyLocation", () => {
  it("points at the served key path on the same host", () => {
    expect(getKeyLocation(SITE)).toBe(`${SITE}${KEY_PATH}`);
  });

  it("does not double up slashes when siteUrl has a trailing slash", () => {
    expect(getKeyLocation("https://revieweriq.com/")).toBe(`${SITE}${KEY_PATH}`);
  });
});

describe("buildPayload", () => {
  it("assembles a spec-compliant payload", () => {
    const payload = buildPayload([`${SITE}/a`, `${SITE}/b`], "abc123", SITE);
    expect(payload.host).toBe("revieweriq.com");
    expect(payload.key).toBe("abc123");
    expect(payload.keyLocation).toBe(`${SITE}${KEY_PATH}`);
    expect(payload.urlList).toEqual([`${SITE}/a`, `${SITE}/b`]);
  });
});

describe("getProductReviewUrls", () => {
  it("returns absolute /category/<cat>/<product> URLs for every product", () => {
    const urls = getProductReviewUrls(SITE);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url).toMatch(new RegExp(`^${SITE}/category/[^/]+/[^/]+$`));
    }
    // No duplicates.
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("submitToIndexNow", () => {
  it("skips (no request) when no URLs are provided", async () => {
    const fetchMock = vi.fn();
    const result = await submitToIndexNow([], { key: "k", siteUrl: SITE, fetch: fetchMock as unknown as typeof fetch });
    expect(result).toMatchObject({ ok: true, skipped: true, reason: "no-urls", submitted: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips gracefully when the key is missing", async () => {
    const fetchMock = vi.fn();
    const result = await submitToIndexNow([`${SITE}/a`], { key: "", siteUrl: SITE, fetch: fetchMock as unknown as typeof fetch });
    expect(result).toMatchObject({ ok: false, skipped: true, reason: "missing-key" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a deduplicated payload to the IndexNow endpoint on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const result = await submitToIndexNow(
      [`${SITE}/a`, `${SITE}/a`, `${SITE}/b`, "", "  "],
      { key: "k", siteUrl: SITE, fetch: fetchMock as unknown as typeof fetch }
    );
    expect(result).toMatchObject({ ok: true, submitted: 2, batches: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe(INDEXNOW_ENDPOINT);
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.urlList).toEqual([`${SITE}/a`, `${SITE}/b`]);
    expect(body.key).toBe("k");
  });

  it("treats a 202 response as accepted", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 202 });
    const result = await submitToIndexNow([`${SITE}/a`], { key: "k", siteUrl: SITE, fetch: fetchMock as unknown as typeof fetch });
    expect(result.ok).toBe(true);
    expect(result.submitted).toBe(1);
  });

  it("reports an error status without throwing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    const result = await submitToIndexNow([`${SITE}/a`], { key: "k", siteUrl: SITE, fetch: fetchMock as unknown as typeof fetch });
    expect(result).toMatchObject({ ok: false, status: 403, reason: "http-403", submitted: 0 });
  });
});
