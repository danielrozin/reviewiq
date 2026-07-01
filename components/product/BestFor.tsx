import type { AISummary } from "@/types";

interface BestForProps {
  summary: AISummary;
  productName: string;
  productSlug: string;
}

export function BestFor({ summary, productName, productSlug }: BestForProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    url: `https://revieweriq.com/category/${productSlug}`,
    description: `Best for: ${summary.bestFor.join(", ")}. Not ideal for: ${summary.notFor.join(", ")}.`,
    additionalProperty: [
      ...summary.bestFor.map((item) => ({
        "@type": "PropertyValue",
        name: "Best For",
        value: item,
      })),
      ...summary.notFor.map((item) => ({
        "@type": "PropertyValue",
        name: "Not Ideal For",
        value: item,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        aria-label="Best for and not ideal for summary"
        data-speakable="best-for"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl overflow-hidden border border-gray-100"
      >
        {/* Best For */}
        <div className="bg-brand-50 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-800 uppercase tracking-wider mb-3">
            <span aria-hidden="true" className="w-5 h-5 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
              <svg aria-hidden="true" className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            Best For
          </h3>
          <ul className="space-y-2">
            {summary.bestFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-900">
                <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-2.5 h-2.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Not Ideal For */}
        <div className="bg-amber-50 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800 uppercase tracking-wider mb-3">
            <span aria-hidden="true" className="w-5 h-5 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
              <svg aria-hidden="true" className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
              </svg>
            </span>
            Not Ideal For
          </h3>
          <ul className="space-y-2">
            {summary.notFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-2.5 h-2.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
