import Link from "next/link";
import { categories } from "@/data/categories";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { categoryListSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "All Product Categories — AI Reviews & Comparisons",
  description:
    "Browse all product categories on ReviewIQ. Find honest, AI-powered reviews across robot vacuums, coffee machines, air fryers, wireless earbuds, mattresses, smart watches, standing desks, blenders, laptops, and electric toothbrushes.",
  path: "/categories",
});

export default function CategoriesPage() {
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categoryListSchema(categories)),
        }}
      />
      <Breadcrumbs items={[{ name: "Categories", url: "/categories" }]} />

      <div className="mt-8 mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Product Categories
        </h1>
        <p className="text-gray-500 max-w-2xl leading-relaxed">
          Explore in-depth product intelligence across {categories.length} popular consumer
          categories — {totalProducts}+ products with AI-analyzed reviews, verified buyer
          insights, and structured comparison data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-brand-100 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200 inline-block">
                {cat.icon}
              </span>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {cat.productCount} products
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
              {cat.name}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
              {cat.description}
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-brand-600 group-hover:gap-2.5 transition-all">
              <span>Explore reviews</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
