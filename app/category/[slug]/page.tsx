import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategorySortedGrid } from "@/components/category/CategorySortedGrid";
import { buildMetadata } from "@/lib/seo/metadata";
import { productListSchema, howToSchema, categoryPageSchema, breadcrumbSchema } from "@/lib/schema/jsonld";
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
          __html: JSON.stringify(categoryPageSchema(category.name, category.description, `/category/${slug}`, "2024-01-01", "2026-07-06")),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: "Categories", url: "/categories" },
            { name: category.name, url: `/category/${slug}` },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productListSchema(categoryProducts, category.name, slug)),
        }}
      />
      {buyingGuide && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema(buyingGuide.title, buyingGuide.steps, slug)),
          }}
        />
      )}
      <Breadcrumbs
        items={[
          { name: "Categories", url: "/categories" },
          { name: category.name, url: `/category/${slug}` },
        ]}
      />

      {/* Category header */}
      <header className="mt-8 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div aria-hidden="true" className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <span aria-hidden="true" className="text-3xl">{category.icon}</span>
              </div>
              <h1 data-speakable="category-name" className="text-3xl font-bold text-gray-900">
                Best {category.name}
              </h1>
            </div>
            <p data-speakable="category-description" className="text-gray-600 max-w-3xl leading-relaxed mt-2">
              {category.description}
            </p>
          </div>
          <dl className="shrink-0 text-right">
            <dd className="text-2xl font-bold text-gray-900">{categoryProducts.length}</dd>
            <dt className="text-sm text-gray-600">products reviewed</dt>
          </dl>
        </div>

        {/* Contextual trust signals */}
        <ul role="list" aria-label="Trust signals" className="flex flex-wrap gap-2 mt-5">
          {[
            {
              label: "AI-analyzed reviews",
              color: "text-brand-600 bg-brand-50 border-brand-100",
              icon: (
                <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              ),
            },
            {
              label: "Verified buyer data",
              color: "text-emerald-700 bg-emerald-50 border-emerald-100",
              icon: (
                <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              ),
            },
            {
              label: "No affiliate bias",
              color: "text-red-600 bg-red-50 border-red-100",
              icon: (
                <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ),
            },
            {
              label: "Sorted by SmartScore",
              color: "text-purple-700 bg-purple-50 border-purple-100",
              icon: (
                <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              ),
            },
          ].map((tag) => (
            <li
              key={tag.label}
              className={`inline-flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-full ${tag.color}`}
            >
              {tag.icon}
              {tag.label}
            </li>
          ))}
        </ul>
      </header>

      {/* Product grid with client-side sort + persistence */}
      <CategorySortedGrid products={categoryProducts} categorySlug={slug} />

      {/* Buying Guide */}
      <section className="mt-16" aria-labelledby="buying-guide-heading" data-speakable="buying-guide">
        <div className="flex items-center gap-3 mb-6">
          <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.966 8.966 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 id="buying-guide-heading" className="text-2xl font-bold text-gray-900">
            {buyingGuide ? buyingGuide.title : `${category.name} Buying Guide`}
          </h2>
        </div>

        {buyingGuide ? (
          <ol className="max-w-3xl">
            {buyingGuide.steps.map((step, index) => (
              <li key={index} className="flex gap-5 group pb-6 last:pb-0">
                {/* Step number + connecting line */}
                <div className="flex flex-col items-center shrink-0">
                  <span aria-hidden="true" className="w-9 h-9 rounded-full bg-brand-600 group-hover:bg-brand-700 text-white font-bold flex items-center justify-center text-sm shadow-md transition-colors z-10">
                    {index + 1}
                  </span>
                  {index < buyingGuide.steps.length - 1 && (
                    <div aria-hidden="true" className="w-0.5 flex-1 bg-brand-100 mt-2 min-h-[24px]" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <div className="bg-white border border-gray-100 rounded-xl p-4 group-hover:border-brand-200 group-hover:shadow-sm group-hover:-translate-y-0.5 transition-all duration-200">
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
            products in this category to see AI-powered review summaries,
            recurring complaints, and structured comparisons.
          </p>
        )}
      </section>
    </div>
  );
}
