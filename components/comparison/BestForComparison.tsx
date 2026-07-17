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
    <section aria-labelledby="who-should-buy-heading" data-speakable="best-for-comparison">
      <div className="flex items-center gap-2.5 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <h2 id="who-should-buy-heading" className="text-lg font-semibold text-gray-900">Who Should Buy What?</h2>
      </div>
      <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 m-0">
        <li><BestForCard product={productA} /></li>
        <li><BestForCard product={productB} /></li>
      </ul>
    </section>
  );
}

function BestForCard({ product }: { product: Product }) {
  const headingId = `best-for-${product.id}`;
  return (
    <article aria-labelledby={headingId} className="border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm motion-safe:hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="p-5">
      <h3 id={headingId} className="text-sm font-semibold text-gray-900 mb-4">
        {product.name}
      </h3>

      <div className="space-y-4">
        <section aria-labelledby={`bestfor-${product.id}`}>
          <h4 id={`bestfor-${product.id}`} className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-2">
            Best For
          </h4>
          <ul role="list" className="space-y-1.5">
            {product.aiSummary.bestFor.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-2.5 h-2.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`notfor-${product.id}`}>
          <h4 id={`notfor-${product.id}`} className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            Not For
          </h4>
          <ul role="list" className="space-y-1.5">
            {product.aiSummary.notFor.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-2.5 h-2.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
      </div>
    </article>
  );
}
