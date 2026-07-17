import Link from "next/link";
import { SmartScore } from "@/components/ui/SmartScore";
import { ProductImage } from "@/components/ui/ProductImage";

interface RelatedProduct {
  name: string;
  slug: string;
  brand: string;
  smartScore: number;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  categorySlug: string;
  categoryName: string;
  image?: string | null;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  categorySlug: string;
  categoryName: string;
}

export function RelatedProducts({
  products,
  categorySlug,
  categoryName,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-products-heading" data-speakable="related-products" className="mt-12">
      <div className="flex items-center gap-2.5 mb-6">
        <div aria-hidden="true" className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h2 id="related-products-heading" className="text-xl font-semibold text-gray-900">Related {categoryName} Products</h2>
      </div>

      {/* ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Related ${categoryName} Products`,
            numberOfItems: products.length,
            isPartOf: { "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"}/#website` },
            publisher: { "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"}/#organization` },
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: product.name,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"}/category/${product.categorySlug}/${product.slug}`,
            })),
          }),
        }}
      />

      <ul role="list" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0">
        {products.map((product) => (
          <li key={product.slug}>
          <Link
            href={`/category/${categorySlug}/${product.slug}`}
            aria-label={`${product.brand} ${product.name} — SmartScore ${product.smartScore}/100, ${product.reviewCount.toLocaleString()} reviews, $${product.priceMin}–$${product.priceMax}`}
            title={`${product.name} review — SmartScore ${product.smartScore}/100`}
            className="group flex flex-col border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
          >
            {/* Hover accent strip */}
            <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            {/* Product Thumbnail */}
            <ProductImage
              src={product.image}
              alt={product.name}
              brand={product.brand}
              size="md"
            />

            {/* Product Info */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <div className="flex items-center gap-2">
                <SmartScore score={product.smartScore} size="sm" />
                <span className="text-xs text-gray-600">{product.categoryName}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                {product.name}
              </p>
              <p className="text-xs text-gray-600">
                {product.brand}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-auto">
                <svg aria-hidden="true" className="w-3 h-3 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" focusable="false">
                  <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
                <span>{product.reviewCount.toLocaleString()}</span>
                <span aria-hidden="true" className="text-gray-200">·</span>
                <span>${product.priceMin}–${product.priceMax}</span>
              </div>
            </div>
          </Link>
          </li>
        ))}
      </ul>

      <Link
        href={`/category/${categorySlug}`}
        className="inline-flex items-center gap-1.5 mt-5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded"
      >
        View all {categoryName} products
        <svg aria-hidden="true" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </section>
  );
}
