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
        data-speakable="best-for"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl overflow-hidden border border-gray-100"
      >
        {/* Best For */}
        <div className="bg-brand-50 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-800 uppercase tracking-wider mb-3">
            <span className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            Best For
          </h2>
          <ul className="space-y-2">
            {summary.bestFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-900">
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

        {/* Not Ideal For */}
        <div className="bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-800 uppercase tracking-wider mb-3">
            <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </span>
            Not Ideal For
          </h2>
          <ul className="space-y-2">
            {summary.notFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
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
      </section>
    </>
  );
}
