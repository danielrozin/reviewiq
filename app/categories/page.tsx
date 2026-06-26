import { categories } from "@/data/categories";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { categoryListSchema } from "@/lib/schema/jsonld";
import { CategorySearch } from "@/components/category/CategorySearch";

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

      {/* Page header */}
      <div className="mt-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Categories
          </h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            {categories.length} categories · {totalProducts}+ products · AI-analyzed reviews from verified buyers
          </p>
        </div>
        {/* Quick stat pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            78% verified buyers
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            20K+ reviews
          </div>
        </div>
      </div>

      {/* Search + grid (client component) */}
      <CategorySearch categories={categories} />
    </div>
  );
}
