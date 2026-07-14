import Link from "next/link";
import type { Product } from "@/types";
import { getComparisonLinksForProduct } from "@/data/comparisons";

interface ComparisonModuleProps {
  product: Product;
}

export function ComparisonModule({ product }: ComparisonModuleProps) {
  // Resolved against the pages that actually get generated — a product's raw
  // `comparisons` list names partners by a stale slug and would link to 404s.
  const links = getComparisonLinksForProduct(product);
  if (links.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Compare With
      </h2>
      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.slug}
            href={`/compare/${link.slug}`}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-brand-200 hover:bg-brand-50/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-bold">
                VS
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                  {product.name} vs {link.partner.name}
                </p>
                {link.searchVolume > 0 && (
                  <p className="text-xs text-gray-400">
                    {link.searchVolume.toLocaleString()} monthly searches
                  </p>
                )}
              </div>
            </div>
            <span className="text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Compare &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
