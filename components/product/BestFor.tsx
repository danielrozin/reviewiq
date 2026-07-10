import type { AISummary } from "@/types";

interface BestForProps {
  summary: AISummary;
}

export function BestFor({ summary }: BestForProps) {
  // Structured-data note: the "Best For / Not Ideal For" PropertyValue signals
  // are emitted as additionalProperty on the single canonical Product node in
  // productSchema() (lib/schema/jsonld.ts). This component used to render its own
  // second Product JSON-LD node with a non-www /category/{slug} url that 404s —
  // a duplicate, unlinked entity with an invalid URL — so it no longer emits any
  // JSON-LD of its own. Keep it presentational only.
  return (
    <>
      <section
        data-speakable="best-for"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl overflow-hidden border border-gray-100"
      >
        {/* Best For */}
        <div className="bg-brand-50 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-800 uppercase tracking-wider mb-3">
            <span className="text-base">✓</span> Best For
          </h2>
          <ul className="space-y-2">
            {summary.bestFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-900">
                <span className="text-brand-500 mt-0.5 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Not Ideal For */}
        <div className="bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-800 uppercase tracking-wider mb-3">
            <span className="text-base">⚠</span> Not Ideal For
          </h2>
          <ul className="space-y-2">
            {summary.notFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
