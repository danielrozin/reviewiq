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
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
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
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
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
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                </span>
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

        <div>
          <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">
            Not For
          </h3>
          <ul className="space-y-2">
            {summary.notFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
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
      </div>
    </section>
  );
}
