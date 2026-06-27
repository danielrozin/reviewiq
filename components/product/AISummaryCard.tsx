import type { AISummary } from "@/types";

interface AISummaryCardProps {
  summary: AISummary;
  score?: number;
}

function getVerdict(score: number): { label: string; sublabel: string; color: string; bg: string; border: string } {
  if (score >= 85) return { label: "Top Pick", sublabel: "Highly recommended by verified buyers", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (score >= 70) return { label: "Recommended", sublabel: "Strong positive sentiment from real users", color: "text-brand-700", bg: "bg-brand-50", border: "border-brand-200" };
  if (score >= 55) return { label: "Worth Considering", sublabel: "Good for specific use cases — read the caveats", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "Mixed Reviews", sublabel: "Significant issues reported — proceed with caution", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
}

export function AISummaryCard({ summary, score }: AISummaryCardProps) {
  const verdict = score !== undefined ? getVerdict(score) : null;

  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-4">
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

      {/* TL;DR Verdict */}
      {verdict && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${verdict.bg} ${verdict.border}`}>
          <svg className={`w-5 h-5 shrink-0 ${verdict.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <div>
            <span className={`text-sm font-bold ${verdict.color}`}>{verdict.label}</span>
            <span className={`text-sm ${verdict.color} opacity-80`}> — {verdict.sublabel}</span>
          </div>
        </div>
      )}

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
