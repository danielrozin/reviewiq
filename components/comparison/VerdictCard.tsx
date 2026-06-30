import type { Product } from "@/types";
import { generateVerdict } from "@/data/comparisons";
import { getScoreBgColor } from "@/lib/utils";
import Link from "next/link";

interface VerdictCardProps {
  productA: Product;
  productB: Product;
}

export function VerdictCard({ productA, productB }: VerdictCardProps) {
  const verdict = generateVerdict(productA, productB);
  const winner =
    productA.smartScore > productB.smartScore
      ? productA
      : productB.smartScore > productA.smartScore
        ? productB
        : null;
  const loser = winner ? (winner.id === productA.id ? productB : productA) : null;
  const scoreDiff = winner && loser ? winner.smartScore - loser.smartScore : 0;

  return (
    <section aria-label="AI Verdict" className="overflow-hidden rounded-2xl border border-brand-200">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4 flex items-center gap-3">
        <div aria-hidden="true" className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">AI Verdict</p>
          <p className="text-brand-200 text-xs">Based on verified buyer reviews</p>
        </div>
        {winner && (
          <div className="ml-auto flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
            <svg aria-hidden="true" className="w-3.5 h-3.5 fill-current text-amber-300" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
            </svg>
            Recommended pick
          </div>
        )}
      </div>

      {/* Body */}
      <div className="bg-gradient-to-br from-brand-50/60 to-white p-6">
        {/* Winner highlight */}
        {winner && loser && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            {/* Winner card */}
            <Link
              href={`/category/${winner.categorySlug}/${winner.slug}`}
              className="flex-1 flex items-center gap-3 bg-white border-2 border-emerald-200 rounded-xl p-3.5 hover:border-emerald-300 hover:shadow-sm transition-all group"
            >
              <div role="img" aria-label={`SmartScore: ${winner.smartScore}`} className={`w-12 h-12 rounded-xl font-bold text-white flex items-center justify-center text-lg shrink-0 ${getScoreBgColor(winner.smartScore)}`}>
                <span aria-hidden="true">{winner.smartScore}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Winner</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">{winner.name}</p>
                <p className="text-xs text-gray-500">{winner.brand}</p>
              </div>
              <svg aria-hidden="true" className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors ml-auto shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>

            {/* Score diff badge */}
            <div className="flex sm:flex-col items-center justify-center gap-1 px-3 shrink-0">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                +{scoreDiff} pts
              </span>
              <span className="text-xs text-gray-500">ahead</span>
            </div>

            {/* Runner up card */}
            <Link
              href={`/category/${loser.categorySlug}/${loser.slug}`}
              className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div role="img" aria-label={`SmartScore: ${loser.smartScore}`} className={`w-12 h-12 rounded-xl font-bold text-white flex items-center justify-center text-lg shrink-0 ${getScoreBgColor(loser.smartScore)}`}>
                <span aria-hidden="true">{loser.smartScore}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Runner-up</p>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-brand-600 transition-colors truncate">{loser.name}</p>
                <p className="text-xs text-gray-500">{loser.brand}</p>
              </div>
              <svg aria-hidden="true" className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors ml-auto shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        )}

        {/* Tie state */}
        {!winner && (
          <div className="flex items-center justify-center gap-2 mb-5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
            <span aria-hidden="true" className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <svg aria-hidden="true" className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97Z" />
              </svg>
            </span>
            <p className="text-sm font-medium text-amber-800">Too close to call — both products are evenly matched.</p>
          </div>
        )}

        {/* AI analysis text */}
        <p data-speakable="comparison-verdict" className="text-gray-700 text-sm leading-relaxed">{verdict}</p>
      </div>
    </section>
  );
}
