import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { productListSchema, howToSchema } from "@/lib/schema/jsonld";
import { categories } from "@/data/categories";
import { getBuyingGuide } from "@/data/buying-guides";
import { getAllComparisonPairs } from "@/data/comparisons";
import { getAffinityCategories } from "@/data/category-affinity";
import { TrackCategoryView } from "@/components/product/ProductPageClientWidgets";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return buildMetadata({
    title: `Best ${category.name} — Reviews & Comparisons`,
    description: category.description,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryProducts = getProductsByCategory(slug);
  const buyingGuide = getBuyingGuide(slug);

  // Internal linking: top comparison pages within this category (funnels
  // crawl + authority from the category hub to high-intent /compare pages).
  const categoryComparisons = getAllComparisonPairs()
    .filter(
      (pair) =>
        pair.productA.categorySlug === slug ||
        pair.productB.categorySlug === slug
    )
    .slice(0, 6);

  // Internal linking: sibling categories (removes the category dead-end and
  // spreads link equity across related hubs).
  const relatedCategories = getAffinityCategories(slug)
    .map((affinity) => getCategoryBySlug(affinity.slug))
    .filter((cat): cat is NonNullable<typeof cat> => Boolean(cat))
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TrackCategoryView slug={slug} productCount={categoryProducts.length} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productListSchema(categoryProducts, category.name)
          ),
        }}
      />
      {buyingGuide && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              howToSchema(buyingGuide.title, buyingGuide.steps, slug)
            ),
          }}
        />
      )}
      <Breadcrumbs
        items={[
          { name: "Categories", url: "/categories" },
          { name: category.name, url: `/category/${slug}` },
        ]}
      />

      <div className="mt-8 mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{category.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">
            Best {category.name}
          </h1>
        </div>
        <p className="text-gray-500 max-w-3xl leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryProducts
          .sort((a, b) => b.smartScore - a.smartScore)
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>

      {/* Buying Guide */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {buyingGuide ? buyingGuide.title : `Buying Guide: ${category.name}`}
        </h2>
        {buyingGuide ? (
          <ol className="space-y-6 max-w-3xl">
            {buyingGuide.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {step.name}
                  </h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="prose prose-gray max-w-3xl">
            <p className="text-gray-600 leading-relaxed">
              Choosing the right product in the {category.name.toLowerCase()}{" "}
              category can be overwhelming. ReviewIQ analyzes verified buyer
              experiences to help you understand what matters most — from
              performance and reliability to value and common issues. Browse the
              products above to see AI-powered review summaries, recurring
              complaints, and structured comparisons.
            </p>
          </div>
        )}
      </section>

      {/* Internal linking: high-intent comparison pages within this category */}
      {categoryComparisons.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Popular {category.name} Comparisons
          </h2>
          <p className="text-gray-500 mb-6 max-w-3xl">
            See how the top {category.name.toLowerCase()} stack up head-to-head.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryComparisons.map((pair) => (
              <li key={pair.slug}>
                <Link
                  href={`/compare/${pair.slug}`}
                  className="block rounded-lg border border-gray-200 px-4 py-3 text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <span className="font-medium">{pair.productA.name}</span>
                  <span className="text-gray-400"> vs </span>
                  <span className="font-medium">{pair.productB.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Internal linking: related category hubs (removes the dead-end) */}
      {relatedCategories.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Categories
          </h2>
          <ul className="flex flex-wrap gap-3">
            {relatedCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
