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
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Compare on A vs B</h2>
      </div>
      <div className="space-y-3">
        <a
          href={entityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                All {productName} Comparisons
              </p>
              <p className="text-xs text-gray-400">on aversusb.net</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </a>

        <a
          href={alternativesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                Alternatives to {productName}
              </p>
              <p className="text-xs text-gray-400">on aversusb.net</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </a>

        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-purple-600 hover:text-purple-700 hover:underline"
        >
          Search all {productName} comparisons on A vs B
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
