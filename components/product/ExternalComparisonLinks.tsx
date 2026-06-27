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
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Head-to-Head Comparisons</h2>
      </div>
      <div className="space-y-3">
        {comparisons.map((comp, i) => (
          <a
            key={i}
            href={comp.url}
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
                  {comp.title}
                </p>
                <p className="text-xs text-gray-400">
                  on {comp.source}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
