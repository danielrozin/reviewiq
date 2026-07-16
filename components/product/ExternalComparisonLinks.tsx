import Link from "next/link";

export interface ExternalComparison {
  title: string;
  url: string;
  source: string;
}

interface ExternalComparisonLinksProps {
  comparisons: ExternalComparison[];
}

export function ExternalComparisonLinks({
  comparisons,
}: ExternalComparisonLinksProps) {
  if (comparisons.length === 0) return null;

  return (
    <section aria-labelledby="external-comparisons-heading" data-speakable="external-comparisons">
      <div className="flex items-center gap-2.5 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
          </svg>
        </div>
        <h2 id="external-comparisons-heading" className="text-lg font-semibold text-gray-900">Head-to-Head Comparisons</h2>
      </div>
      <ul role="list" className="space-y-3 list-none p-0 m-0">
        {comparisons.map((comp, i) => (
          <li key={i}>
            <a
              href={comp.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${comp.title} on ${comp.source} (opens in new tab)`}
              className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-1"
            >
              <div className="flex items-center gap-3">
                <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
                  </svg>
                </div>
                <div aria-hidden="true">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    {comp.title}
                  </p>
                  <p className="text-xs text-gray-600">on {comp.source}</p>
                </div>
              </div>
              <span aria-hidden="true" className="inline-flex items-center gap-1 text-purple-600 text-xs font-medium shrink-0 ml-3">
                View
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
