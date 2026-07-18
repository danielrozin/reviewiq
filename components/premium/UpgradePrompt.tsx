"use client";

import Link from "next/link";

type GateType = "saved_comparisons" | "advanced_filters" | "export" | "general";

const GATE_COPY: Record<GateType, { title: string; description: string }> = {
  saved_comparisons: {
    title: "Save Unlimited Comparisons",
    description: "Free accounts can save up to 3 products. Upgrade to Pro for unlimited saved comparisons.",
  },
  advanced_filters: {
    title: "Unlock Advanced Filters",
    description: "Custom price ranges and multi-attribute sorting are available with ReviewIQ Pro.",
  },
  export: {
    title: "Export Comparisons",
    description: "Download your comparisons as CSV or PDF with ReviewIQ Pro.",
  },
  general: {
    title: "Upgrade to ReviewIQ Pro",
    description: "Get unlimited saves, advanced filters, exports, and an ad-free experience.",
  },
};

function GateIcon({ gate, className }: { gate: GateType; className: string }) {
  if (gate === "saved_comparisons") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
      </svg>
    );
  }
  if (gate === "advanced_filters") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
      </svg>
    );
  }
  if (gate === "export") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

interface UpgradePromptProps {
  gate: GateType;
  compact?: boolean;
}

export function UpgradePrompt({ gate, compact = false }: UpgradePromptProps) {
  const { title, description } = GATE_COPY[gate];

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
        <span aria-hidden="true"><GateIcon gate={gate} className="w-5 h-5 text-amber-600 shrink-0" /></span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900">{title}</p>
        </div>
        <Link
          href="/pricing"
          aria-label={`Upgrade to Pro — ${title}`}
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] bg-amber-600 text-white text-xs font-medium rounded-xl hover:bg-amber-700 transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-amber-600"
        >
          <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          <span aria-hidden="true">Upgrade</span>
        </Link>
      </div>
    );
  }

  return (
    <div role="region" aria-labelledby={`upgrade-prompt-${gate}`} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 p-6 text-center">
      <div aria-hidden="true" className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="relative">
        <div aria-hidden="true" className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <GateIcon gate={gate} className="w-6 h-6 text-amber-600" />
        </div>
        <h3 id={`upgrade-prompt-${gate}`} className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-5 max-w-sm mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-amber-600"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            Upgrade to Pro
          </Link>
          <span className="text-xs text-gray-600">Starting at $9/month</span>
        </div>
        <ul role="list" aria-label="Pro features" className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600 list-none p-0 m-0">
          <li className="flex items-center gap-1">
            <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            Unlimited saves
          </li>
          <li className="flex items-center gap-1">
            <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            Advanced filters
          </li>
          <li className="flex items-center gap-1">
            <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
            Ad-free
          </li>
        </ul>
      </div>
    </div>
  );
}
