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
    <section aria-labelledby="what-people-say" data-speakable="pros-cons">
      <div className="flex items-center gap-2.5 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </div>
        <h2 id="what-people-say" className="text-lg font-semibold text-gray-900">What People Say</h2>
      </div>
      <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 m-0">
        <li><ProductProsConsCard product={productA} /></li>
        <li><ProductProsConsCard product={productB} /></li>
      </ul>
    </section>
  );
}

function ProductProsConsCard({ product }: { product: Product }) {
  const headingId = `pros-cons-${product.id}`;
  return (
    <article aria-labelledby={headingId} className="border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:transition-all duration-200 overflow-hidden group">
      <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="p-5">
      <h3 id={headingId} className="text-sm font-semibold text-gray-900 mb-4">
        {product.name}
      </h3>

      <div className="space-y-4">
        <section aria-labelledby={`love-${product.id}`}>
          <h4 id={`love-${product.id}`} className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            What People Love
          </h4>
          <ul role="list" className="space-y-1.5">
            {product.aiSummary.whatPeopleLove.slice(0, 4).map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`hate-${product.id}`}>
          <h4 id={`hate-${product.id}`} className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
            What People Hate
          </h4>
          <ul role="list" className="space-y-1.5">
            {product.aiSummary.whatPeopleHate.slice(0, 3).map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-2.5 h-2.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
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
