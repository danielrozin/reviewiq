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
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Related {categoryName} Products
      </h2>

      {/* ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Related ${categoryName} Products`,
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: product.name,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"}/category/${product.categorySlug}/${product.slug}`,
            })),
          }),
        }}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/category/${categorySlug}/${product.slug}`}
            title={`${product.name} review — SmartScore ${product.smartScore}/100`}
            className="group flex flex-col border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-md transition-all"
          >
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
                <span className="text-xs text-gray-400">{product.categoryName}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                {product.name}
              </p>
              <p className="text-xs text-gray-500">
                {product.brand}
              </p>
              <p className="text-xs text-gray-400 mt-auto">
                {product.reviewCount.toLocaleString()} reviews &middot; ${product.priceMin}&ndash;${product.priceMax}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href={`/category/${categorySlug}`}
        className="inline-block mt-5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
      >
        View all {categoryName} products &rarr;
      </Link>
    </section>
  );
}
