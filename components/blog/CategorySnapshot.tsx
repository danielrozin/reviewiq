import Link from "next/link";
import { getProductsByCategory } from "@/data/products";
import { productAverageRating } from "@/lib/utils";

interface CategorySnapshotProps {
  categorySlug: string;
  categoryName: string;
}

/**
 * Every figure here is derived from the products we actually track — never written
 * by hand — so each category page reads differently by construction. Renders nothing
 * when a category has no products rather than printing zeroes.
 */
export function CategorySnapshot({
  categorySlug,
  categoryName,
}: CategorySnapshotProps) {
  const products = getProductsByCategory(categorySlug);
  if (products.length === 0) return null;

  const lower = categoryName.toLowerCase();
  const reviewsAnalyzed = products.reduce((n, p) => n + p.reviewCount, 0);

  const rated = products
    .map((p) => ({ product: p, rating: productAverageRating(p) }))
    .filter((r) => r.rating > 0);
  const categoryAverage =
    rated.length > 0
      ? rated.reduce((n, r) => n + r.rating, 0) / rated.length
      : 0;

  const topRated = [...products]
    .sort((a, b) => b.smartScore - a.smartScore)
    .slice(0, 3);

  const prices = products.map((p) => p.priceRange);
  const priceLow = Math.min(...prices.map((p) => p.min));
  const priceHigh = Math.max(...prices.map((p) => p.max));

  // Same complaint reported on several products is the category-level pattern —
  // sum its mentions across the models that share it.
  const issuesByTitle = new Map<
    string,
    { title: string; mentions: number; products: number }
  >();
  for (const p of products) {
    for (const issue of p.recurringIssues) {
      const key = issue.title.toLowerCase();
      const seen = issuesByTitle.get(key);
      if (seen) {
        seen.mentions += issue.mentionCount;
        seen.products += 1;
      } else {
        issuesByTitle.set(key, {
          title: issue.title,
          mentions: issue.mentionCount,
          products: 1,
        });
      }
    }
  }
  const topIssues = [...issuesByTitle.values()]
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 3);

  return (
    <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        The {lower} market at a glance
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        We track {products.length} {lower} and have analysed{" "}
        {reviewsAnalyzed.toLocaleString("en-US")} owner reviews across them. The
        category averages{" "}
        <strong className="font-semibold text-gray-900">
          {categoryAverage.toFixed(1)} out of 5
        </strong>
        , with tracked models priced from ${priceLow.toLocaleString("en-US")} to
        ${priceHigh.toLocaleString("en-US")}. The guides below go deeper — start
        with the top-rated models if you are buying now.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Highest rated {lower} we track
          </h3>
          <ol className="mt-3 space-y-3">
            {topRated.map((p, i) => (
              <li key={p.id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                  {i + 1}
                </span>
                <span className="text-gray-600">
                  <Link
                    href={`/category/${categorySlug}/${p.slug}`}
                    className="font-medium text-gray-900 hover:text-brand-600 hover:underline"
                  >
                    {p.name}
                  </Link>{" "}
                  — {productAverageRating(p).toFixed(1)}/5 from{" "}
                  {p.reviewCount.toLocaleString("en-US")} reviews, scoring{" "}
                  {p.smartScore}/100 on our SmartScore.
                </span>
              </li>
            ))}
          </ol>
        </div>

        {topIssues.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              What owners complain about most
            </h3>
            <ul className="mt-3 space-y-3">
              {topIssues.map((issue) => (
                <li key={issue.title} className="text-sm text-gray-600">
                  <strong className="font-medium text-gray-900">
                    {issue.title}
                  </strong>{" "}
                  — raised in {issue.mentions.toLocaleString("en-US")} reviews
                  {issue.products > 1
                    ? ` across ${issue.products} of the ${lower} we track`
                    : ""}
                  .
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
