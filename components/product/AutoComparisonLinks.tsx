/**
 * AutoComparisonLinks — generates cross-site links to aversusb.net
 * based on the product name. Shown when no manual externalComparisons
 * are provided, giving every product page a link back to comparison content.
 */

const AVERSUSB_URL = process.env.NEXT_PUBLIC_AVERSUSB_URL || "https://www.aversusb.net";

interface AutoComparisonLinksProps {
  productName: string;
  productSlug: string;
}

export function AutoComparisonLinks({ productName, productSlug }: AutoComparisonLinksProps) {
  const searchQuery = encodeURIComponent(productName);
  const entityUrl = `${AVERSUSB_URL}/entity/${productSlug}`;
  const alternativesUrl = `${AVERSUSB_URL}/alternatives/${productSlug}`;
  const searchUrl = `${AVERSUSB_URL}/search?q=${searchQuery}`;

  return (
    <section aria-labelledby="auto-comparison-links-heading" data-speakable="comparison-links">
      <div className="flex items-center gap-2.5 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
          </svg>
        </div>
        <h2 id="auto-comparison-links-heading" className="text-lg font-semibold text-gray-900">Compare on A vs B</h2>
      </div>
      <div className="space-y-3">
        <a
          href={entityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-1"
        >
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
              <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                All {productName} Comparisons
              </p>
              <p className="text-xs text-gray-500">on aversusb.net</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-purple-600 text-xs font-medium shrink-0 ml-3">
            View
            <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </span>
        </a>

        <a
          href={alternativesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-1"
        >
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
              <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                Alternatives to {productName}
              </p>
              <p className="text-xs text-gray-500">on aversusb.net</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-purple-600 text-xs font-medium shrink-0 ml-3">
            View
            <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </span>
        </a>

        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-purple-600 hover:text-purple-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:rounded focus-visible:ring-offset-1"
        >
          Search all {productName} comparisons on A vs B
          <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
