import Link from "next/link";
import { Suspense } from "react";
import { comparisonHubSchema } from "@/lib/schema/jsonld";
import { getAllComparisonPairs } from "@/data/comparisons";
import CompareBuilder, { CompareBuilderSkeleton } from "./CompareBuilder";

// Server component on purpose.
//
// The interactive builder reads `?ids=` via useSearchParams, which makes its
// subtree client-only: Next omits it from the prerendered HTML and ships the
// Suspense fallback instead. When the whole page was that one client component,
// the HTML crawlers received was a loading skeleton — no <h1>, no copy, and no
// links to any of the comparison pages, even though the hub's ItemList JSON-LD
// claimed them. Everything below that a crawler needs is therefore rendered on
// the server, and only the builder stays behind the Suspense boundary.
export default function ComparePage() {
  const pairs = getAllComparisonPairs();

  return (
    <>
      {/* Hub CollectionPage + ItemList schema. Emitted only on the /compare index
          route (NOT the shared layout), so it does not leak the full comparison
          list onto every /compare/[slug] detail money page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonHubSchema(pairs)) }}
      />

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
          Compare Products Side-by-Side
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stack any two or more products against each other on SmartScore, specs, and
          verified buyer reviews. Search below to build your own comparison, or jump
          into one of the {pairs.length} head-to-heads our readers check most.
        </p>
      </div>

      <Suspense fallback={<CompareBuilderSkeleton />}>
        <CompareBuilder />
      </Suspense>

      {/* Crawlable internal links to every comparison page. These are the hub's
          child money pages: without them the only path to a /compare/[slug] page
          was the sitemap. */}
      <section className="max-w-6xl mx-auto px-4 pb-16 pt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">All comparisons</h2>
        <p className="text-sm text-gray-500 mb-6">
          Every head-to-head we&apos;ve scored, each one built on verified buyer reviews.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map((pair) => (
            <li key={pair.slug}>
              <Link
                href={`/compare/${pair.slug}`}
                className="block rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:border-brand-500 hover:text-brand-700 transition-colors"
              >
                <span className="font-medium text-gray-900">{pair.productA.name}</span>
                <span className="text-gray-400"> vs </span>
                <span className="font-medium text-gray-900">{pair.productB.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
