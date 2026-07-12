import Link from "next/link";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductSearch } from "@/components/product/ProductSearch";
import { productsHubSchema } from "@/lib/schema/jsonld";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { productDisplayName } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Browse All Products — Reviews, SmartScores & Prices",
  description:
    "Search and filter products across all categories. Sort by SmartScore, price, ratings, and more. Find the perfect product with ReviewIQ.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productsHubSchema(products)),
        }}
      />
      <Breadcrumbs
        items={[{ name: "Products", url: "/products" }]}
      />

      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Browse Products
        </h1>
        <p className="mt-2 text-gray-500 max-w-2xl">
          Search and filter across all categories to find the right product for
          you. Every score is based on verified buyer reviews.
        </p>
      </div>

      {/* ProductSearch reads `?q=`/`?sort=` via useSearchParams, which makes its
          subtree client-only: Next omits it from the prerendered HTML and ships
          this fallback instead. So nothing it renders — including all 100 product
          cards — reaches a crawler. The static index below is what makes the hub's
          ItemList JSON-LD true and gives every product page an internal link. */}
      <Suspense fallback={<ProductSearchSkeleton />}>
        <ProductSearch />
      </Suspense>

      <section className="mt-16 border-t border-gray-200 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-1">All products</h2>
        <p className="text-sm text-gray-500 mb-8">
          Every one of the {products.length} products we&apos;ve scored, by category.
        </p>

        <div className="space-y-8">
          {categories.map((category) => {
            const categoryProducts = products.filter(
              (product) => product.categorySlug === category.slug
            );
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.slug}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  <Link
                    href={`/category/${category.slug}`}
                    className="hover:text-brand-700 transition-colors"
                  >
                    {category.name}
                  </Link>
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryProducts.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={`/category/${category.slug}/${product.slug}`}
                        className="block rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:border-brand-500 hover:text-brand-700 transition-colors"
                      >
                        {productDisplayName(product)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ProductSearchSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-gray-100 rounded-xl" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
