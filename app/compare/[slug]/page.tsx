import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllComparisonPairs, getComparisonBySlug } from "@/data/comparisons";
import { getCategoryBySlug } from "@/data/categories";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ScoreComparison } from "@/components/comparison/ScoreComparison";
import { SpecsComparisonTable } from "@/components/comparison/SpecsComparisonTable";
import { ProsConsComparison } from "@/components/comparison/ProsConsComparison";
import { VerdictCard } from "@/components/comparison/VerdictCard";
import { BestForComparison } from "@/components/comparison/BestForComparison";
import { PriceComparison } from "@/components/comparison/PriceComparison";
import { buildMetadata } from "@/lib/seo/metadata";
import { comparisonSchema } from "@/lib/schema/jsonld";
import { AnalysisDisclosure } from "@/components/product/AnalysisDisclosure";
import { ShareButtons } from "@/components/ui/ShareButtons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllComparisonPairs().map((pair) => ({ slug: pair.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pair = getComparisonBySlug(slug);
  if (!pair) return {};

  const { productA, productB } = pair;
  return buildMetadata({
    title: `${productA.name} vs ${productB.name} — Side-by-Side Comparison`,
    description: `Compare ${productA.name} (SmartScore ${productA.smartScore}) vs ${productB.name} (SmartScore ${productB.smartScore}). See specs, pros & cons, pricing, and which is better based on ${productA.reviewCount + productB.reviewCount} verified reviews.`,
    path: `/compare/${slug}`,
    ogType: "article",
    keywords: [productA.name, productB.name, "comparison", "vs", "review"],
  });
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const pair = getComparisonBySlug(slug);

  if (!pair) notFound();

  const { productA, productB, searchVolume } = pair;
  const category = getCategoryBySlug(productA.categorySlug);

  const breadcrumbItems = [
    { name: "Categories", url: "/categories" },
    ...(category ? [{ name: category.name, url: `/category/${category.slug}` }] : []),
    { name: `${productA.name} vs ${productB.name}`, url: `/compare/${slug}` },
  ];

  const jsonLd = comparisonSchema(productA, productB);

  return (
    <>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 data-speakable="comparison-headline" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {productA.name} vs {productB.name}
          </h1>
          <p data-speakable="comparison-summary" className="text-gray-600 text-sm">
            Side-by-side comparison based on {productA.reviewCount + productB.reviewCount} verified buyer reviews
          </p>
          {searchVolume > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              {searchVolume.toLocaleString()} monthly searches for this comparison
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <ShareButtons
              url={`/compare/${slug}`}
              title={`${productA.name} vs ${productB.name} — Side-by-Side Comparison`}
              description={`Compare ${productA.name} vs ${productB.name} based on ${productA.reviewCount + productB.reviewCount} verified reviews.`}
            />
          </div>
        </div>

        {/* Quick links to individual product pages */}
        <nav aria-label="Full product reviews" className="flex justify-center gap-4 mb-8">
          <Link
            href={`/category/${productA.categorySlug}/${productA.slug}`}
            className="text-sm text-brand-600 hover:text-brand-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            Full {productA.name} review &rarr;
          </Link>
          <Link
            href={`/category/${productB.categorySlug}/${productB.slug}`}
            className="text-sm text-brand-600 hover:text-brand-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            Full {productB.name} review &rarr;
          </Link>
        </nav>

        <div className="space-y-8">
          <ScoreComparison productA={productA} productB={productB} />
          <VerdictCard productA={productA} productB={productB} />
          <PriceComparison productA={productA} productB={productB} />
          <SpecsComparisonTable productA={productA} productB={productB} />
          <ProsConsComparison productA={productA} productB={productB} />
          <BestForComparison productA={productA} productB={productB} />
          <AnalysisDisclosure productName={`${productA.name} vs ${productB.name}`} />
        </div>

        {/* Related comparisons in same category */}
        {category && <RelatedComparisons currentSlug={slug} categorySlug={category.slug} />}
      </div>
    </>
  );
}

function RelatedComparisons({
  currentSlug,
  categorySlug,
}: {
  currentSlug: string;
  categorySlug: string;
}) {
  const allPairs = getAllComparisonPairs();
  const related = allPairs
    .filter(
      (p) =>
        p.slug !== currentSlug &&
        (p.productA.categorySlug === categorySlug ||
          p.productB.categorySlug === categorySlug)
    )
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-comparisons-heading" data-speakable="comparison-links" className="mt-12">
      <h2 id="related-comparisons-heading" className="text-lg font-semibold text-gray-900 mb-4">
        More Comparisons
      </h2>
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {related.map((pair) => (
          <li key={pair.slug}>
            <Link
              href={`/compare/${pair.slug}`}
              className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-brand-200 hover:bg-brand-50/30 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              <div aria-hidden="true" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-bold shrink-0">
                VS
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                  {pair.productA.name} vs {pair.productB.name}
                </p>
                {pair.searchVolume > 0 && (
                  <p className="text-xs text-gray-600">
                    {pair.searchVolume.toLocaleString()} monthly searches
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
