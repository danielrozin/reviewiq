import Link from "next/link";
import { categories } from "@/data/categories";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { categoryListSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "All Categories",
  description:
    "Browse all product categories on SmartReview. Find honest, AI-powered reviews across robot vacuums, coffee machines, air fryers, wireless earbuds, and mattresses.",
  path: "/categories",
});

export default function CategoriesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">
          Product Categories
        </h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Explore in-depth product intelligence across popular consumer
          categories. Every category features AI-analyzed reviews, verified buyer
          insights, and structured comparison data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-gray-200 transition-all"
          >
            <span className="text-4xl mb-4 block">{cat.icon}</span>
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
              {cat.name}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {cat.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {cat.productCount} products
              </span>
              <span className="text-sm font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
