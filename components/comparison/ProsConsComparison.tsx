import type { Product } from "@/types";

interface ProsConsComparisonProps {
  productA: Product;
  productB: Product;
}

export function ProsConsComparison({
  productA,
  productB,
}: ProsConsComparisonProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        What People Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProductProsConsCard product={productA} />
        <ProductProsConsCard product={productB} />
      </div>
    </section>
  );
}

function ProductProsConsCard({ product }: { product: Product }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {product.name}
      </h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            What People Love
          </h4>
          <ul className="space-y-1.5">
            {product.aiSummary.whatPeopleLove.slice(0, 4).map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
            What People Hate
          </h4>
          <ul className="space-y-1.5">
            {product.aiSummary.whatPeopleHate.slice(0, 3).map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
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
