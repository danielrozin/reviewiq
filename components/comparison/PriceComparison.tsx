import type { Product } from "@/types";

interface PriceComparisonProps {
  productA: Product;
  productB: Product;
}

export function PriceComparison({
  productA,
  productB,
}: PriceComparisonProps) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Price Comparison</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PriceCard product={productA} isLowest={productA.priceRange.min <= productB.priceRange.min} />
        <PriceCard product={productB} isLowest={productB.priceRange.min < productA.priceRange.min} />
      </div>
    </section>
  );
}

function PriceCard({ product, isLowest }: { product: Product; isLowest: boolean }) {
  const { min, max, currency } = product.priceRange;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <div className={`border rounded-xl p-5 text-center hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 ${isLowest ? "border-emerald-200 bg-emerald-50/40" : "border-gray-100 hover:border-gray-200"}`}>
      {isLowest && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg mb-2">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Best Price
        </span>
      )}
      <p className="text-sm font-semibold text-gray-900 mb-2">
        {product.name}
      </p>
      <p className="text-2xl font-bold text-gray-900">
        {formatter.format(min)}
        {max !== min && (
          <span className="text-gray-400"> – {formatter.format(max)}</span>
        )}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Verified purchase rate: {product.verifiedPurchaseRate}%
      </p>
    </div>
  );
}
