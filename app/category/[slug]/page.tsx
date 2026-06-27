import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategorySortedGrid } from "@/components/category/CategorySortedGrid";
import { buildMetadata } from "@/lib/seo/metadata";
import { productListSchema, howToSchema, breadcrumbSchema } from "@/lib/schema/jsonld";
import { categories } from "@/data/categories";
import { getBuyingGuide } from "@/data/buying-guides";
import { TrackCategoryView } from "@/components/tracking/TrackCategoryView";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Categories", url: "/categories" },
              { name: category.name, url: `/category/${slug}` },
            ])
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Categories", url: "/categories" },
          { name: category.name, url: `/category/${slug}` },
        ]}
      />

      {/* Category header */}
      <div className="mt-8 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{category.icon}</span>
              <h1 className="text-3xl font-bold text-gray-900">
                Best {category.name}
              </h1>
            </div>
            <p className="text-gray-500 max-w-3xl leading-relaxed">
              {category.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold text-gray-900">{categoryProducts.length}</p>
            <p className="text-sm text-gray-400">products reviewed</p>
          </div>
        </div>

        {/* Contextual trust signals */}
        <div className="flex flex-wrap gap-3 mt-5">
          {[
            { label: "AI-analyzed reviews", icon: "🤖" },
            { label: "Verified buyer data", icon: "✓" },
            { label: "No affiliate bias", icon: "🛡️" },
            { label: `Sorted by SmartScore`, icon: "📊" },
          ].map((tag) => (
            <span
              key={tag.label}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full"
            >
              <span>{tag.icon}</span>
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Product grid with client-side sort + persistence */}
      <CategorySortedGrid products={categoryProducts} categorySlug={slug} />

      {/* Buying Guide */}
      <section className="mt-16" aria-label="Buying guide" data-speakable="buying-guide">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.966 8.966 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {buyingGuide ? buyingGuide.title : `${category.name} Buying Guide`}
          </h2>
        </div>

        {buyingGuide ? (
          <ol className="max-w-3xl">
            {buyingGuide.steps.map((step, index) => (
              <li key={index} className="flex gap-5 group pb-6 last:pb-0">
                {/* Step number + connecting line */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="w-9 h-9 rounded-full bg-brand-600 group-hover:bg-brand-700 text-white font-bold flex items-center justify-center text-sm shadow-md transition-colors z-10">
                    {index + 1}
                  </span>
                  {index < buyingGuide.steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-brand-100 mt-2 min-h-[24px]" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <div className="bg-white border border-gray-100 rounded-xl p-4 group-hover:border-brand-100 group-hover:shadow-sm transition-all">
                    <h3 className="font-semibold text-gray-900 capitalize mb-1">
                      {step.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {step.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-600 leading-relaxed max-w-3xl">
            Choosing the right product in the {category.name.toLowerCase()}{" "}
            category can be overwhelming. ReviewIQ analyzes verified buyer
            experiences to help you understand what matters most — from
            performance and reliability to value and common issues. Browse the
            products above to see AI-powered review summaries, recurring
            complaints, and structured comparisons.
          </p>
        )}
      </section>
    </div>
  );
}
