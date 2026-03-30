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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Compare on A vs B
      </h2>
      <div className="space-y-3">
        <a
          href={entityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs font-bold">
              A⚡B
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                All {productName} Comparisons
              </p>
              <p className="text-xs text-gray-400">on aversusb.net</p>
            </div>
          </div>
          <span className="text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View &rarr;
          </span>
        </a>

        <a
          href={alternativesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs font-bold">
              A⚡B
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                Alternatives to {productName}
              </p>
              <p className="text-xs text-gray-400">on aversusb.net</p>
            </div>
          </div>
          <span className="text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View &rarr;
          </span>
        </a>

        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-xs text-purple-600 hover:text-purple-700 hover:underline"
        >
          Search all {productName} comparisons on A vs B &rarr;
        </a>
      </div>
    </section>
  );
}
