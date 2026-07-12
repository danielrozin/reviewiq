import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllComparisonPairs, getComparisonBySlug, comparisonFaq } from "@/data/comparisons";
import { getCategoryBySlug } from "@/data/categories";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ScoreComparison } from "@/components/comparison/ScoreComparison";
import { SpecsComparisonTable } from "@/components/comparison/SpecsComparisonTable";
import { ProsConsComparison } from "@/components/comparison/ProsConsComparison";
import { VerdictCard } from "@/components/comparison/VerdictCard";
import { BestForComparison } from "@/components/comparison/BestForComparison";
import { PriceComparison } from "@/components/comparison/PriceComparison";
import { buildMetadata, ogImageForSegment } from "@/lib/seo/metadata";
import { comparisonSchema } from "@/lib/schema/jsonld";
import { AnalysisDisclosure } from "@/components/product/AnalysisDisclosure";
import { FAQSection } from "@/components/product/FAQSection";
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
  const year = new Date().getFullYear();

  // Keep the meta description under Google's ~160-char SERP truncation limit so
  // the click-driving tail (review count / "which wins") isn't cut off. Product
  // names vary in length, so degrade gracefully for very long pairs.
  const names = `${productA.name} vs ${productB.name}`;
  const totalReviews = productA.reviewCount + productB.reviewCount;
  const full = `Compare ${names}: SmartScores, specs, pros & cons & pricing from ${totalReviews} verified reviews. See which wins.`;
  const mid = `Compare ${names}: SmartScores, specs, pros & cons & pricing from ${totalReviews} verified reviews.`;
  const short = `${names}: compare SmartScores, specs, pros & cons & pricing. See which is better.`;
  const description =
    full.length <= 160 ? full : mid.length <= 160 ? mid : short;

  return buildMetadata({
    title: `${productA.name} vs ${productB.name} (${year}) — Which Is Better?`,
    description,
    path: `/compare/${slug}`,
    image: ogImageForSegment(`/compare/${slug}`),
  });
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const pair = getComparisonBySlug(slug);

  if (!pair) notFound();

  const { productA, productB, searchVolume } = pair;
  const category = getCategoryBySlug(productA.categorySlug);

  const breadcrumbItems = [
    ...(category
      ? [{ name: category.name, url: `/category/${category.slug}` }]
      : []),
    {
      name: `${productA.name} vs ${productB.name}`,
      url: `/compare/${slug}`,
    },
  ];

  const jsonLd = comparisonSchema(productA, productB);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {productA.name} vs {productB.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Side-by-side comparison based on {productA.reviewCount + productB.reviewCount} verified buyer reviews
          </p>
          {searchVolume > 0 && (
            <p className="text-xs text-gray-400 mt-1">
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
        <div className="flex justify-center gap-4 mb-8">
          <Link
            href={`/category/${productA.categorySlug}/${productA.slug}`}
            className="text-sm text-brand-600 hover:text-brand-700 underline underline-offset-2"
          >
            Full {productA.name} review &rarr;
          </Link>
          <Link
            href={`/category/${productB.categorySlug}/${productB.slug}`}
            className="text-sm text-brand-600 hover:text-brand-700 underline underline-offset-2"
          >
            Full {productB.name} review &rarr;
          </Link>
        </div>

        <div className="space-y-8">
          <ScoreComparison productA={productA} productB={productB} />
          <VerdictCard productA={productA} productB={productB} />
          <PriceComparison productA={productA} productB={productB} />
          <SpecsComparisonTable productA={productA} productB={productB} />
          <ProsConsComparison productA={productA} productB={productB} />
          <BestForComparison productA={productA} productB={productB} />
          <FAQSection items={comparisonFaq(productA, productB)} />
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
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        More Comparisons
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {related.map((pair) => (
          <Link
            key={pair.slug}
            href={`/compare/${pair.slug}`}
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-brand-200 hover:bg-brand-50/30 transition-all group"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-bold shrink-0">
              VS
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                {pair.productA.name} vs {pair.productB.name}
              </p>
              {pair.searchVolume > 0 && (
                <p className="text-xs text-gray-400">
                  {pair.searchVolume.toLocaleString()} monthly searches
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
