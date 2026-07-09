/**
 * Submits all public ReviewIQ URLs to IndexNow so search engines re-crawl
 * pages carrying structured data (Review, AggregateRating, BlogPosting, etc.).
 *
 * Usage:
 *   INDEXNOW_KEY=<key> NEXT_PUBLIC_SITE_URL=https://revieweriq.com \
 *     npm run submit:indexnow
 *
 * Exits non-zero if the submission fails so it can gate CI / deploy hooks.
 */
import {
  submitAllPublicUrls,
  getAllPublicUrls,
  getProductReviewUrls,
  getBlogPostUrls,
  getCategoryUrls,
  getComparisonUrls,
  getIndexNowKey,
} from "../lib/seo/indexnow";

async function main() {
  const productUrls = getProductReviewUrls();
  const blogUrls = getBlogPostUrls();
  const categoryUrls = getCategoryUrls();
  const comparisonUrls = getComparisonUrls();
  const total = getAllPublicUrls().length;

  console.log(`[indexnow] URLs to submit:`);
  console.log(`  product/review : ${productUrls.length}`);
  console.log(`  blog posts     : ${blogUrls.length}`);
  console.log(`  categories     : ${categoryUrls.length}`);
  console.log(`  comparisons    : ${comparisonUrls.length}`);
  console.log(`  total          : ${total}`);

  if (!getIndexNowKey()) {
    console.error(
      "[indexnow] INDEXNOW_KEY is not set — cannot submit. Set it in the environment first."
    );
    process.exit(1);
  }

  const result = await submitAllPublicUrls();
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
