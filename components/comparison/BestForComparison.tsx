import type { Product } from "@/types";

interface BestForComparisonProps {
  productA: Product;
  productB: Product;
}

export function BestForComparison({
  productA,
  productB,
}: BestForComparisonProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Who Should Buy What?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BestForCard product={productA} />
        <BestForCard product={productB} />
      </div>
    </section>
  );
}

function BestForCard({ product }: { product: Product }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {product.name}
      </h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-2">
            Best For
          </h4>
          <ul className="space-y-1.5">
            {product.aiSummary.bestFor.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            Not For
          </h4>
          <ul className="space-y-1.5">
            {product.aiSummary.notFor.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
