/**
 * Submits all ReviewIQ product/review page URLs to IndexNow so search engines
 * re-crawl the pages carrying Review / AggregateRating structured data.
 *
 * Usage:
 *   INDEXNOW_KEY=<key> NEXT_PUBLIC_SITE_URL=https://revieweriq.com \
 *     npm run submit:indexnow
 *
 * Exits non-zero if the submission fails so it can gate CI / deploy hooks.
 */
import { submitAllProductReviewUrls, getProductReviewUrls, getIndexNowKey } from "../lib/seo/indexnow";

async function main() {
  const urls = getProductReviewUrls();
  console.log(`[indexnow] ${urls.length} product/review URLs to submit`);

  if (!getIndexNowKey()) {
    console.error(
      "[indexnow] INDEXNOW_KEY is not set — cannot submit. Set it in the environment first."
    );
    process.exit(1);
  }

  const result = await submitAllProductReviewUrls();
  console.log(`[indexnow] result:`, JSON.stringify(result));

  if (!result.ok) {
    console.error(`[indexnow] submission failed: ${result.reason ?? "unknown"}`);
    process.exit(1);
  }

  console.log(
    `[indexnow] submitted ${result.submitted} URL(s) across ${result.batches} batch(es)`
  );
}

main().catch((err) => {
  console.error("[indexnow] unexpected error:", err);
  process.exit(1);
});
