import type { AISummary } from "@/types";

interface AISummaryCardProps {
  summary: AISummary;
}

export function AISummaryCard({ summary }: AISummaryCardProps) {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            AI Review Summary
          </h2>
          <p className="text-xs text-gray-500">
            Synthesized from all verified reviews
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">
            What People Love
          </h3>
          <ul className="space-y-2">
            {summary.whatPeopleLove.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">
            What People Hate
          </h3>
          <ul className="space-y-2">
            {summary.whatPeopleHate.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wider mb-3">
            Best For
          </h3>
          <ul className="space-y-2">
            {summary.bestFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-brand-500 mt-0.5 shrink-0">&#8594;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">
            Not For
          </h3>
          <ul className="space-y-2">
            {summary.notFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 mt-0.5 shrink-0">&#9888;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
