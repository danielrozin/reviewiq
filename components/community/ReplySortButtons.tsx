"use client";

import { useState } from "react";

const SORTS = ["Top", "Recent", "Verified"] as const;
type Sort = typeof SORTS[number];

export function ReplySortButtons() {
  const [active, setActive] = useState<Sort>("Top");

  return (
    <div role="group" aria-label="Sort replies by" className="flex items-center gap-1">
      {SORTS.map((tab) => (
        <button
          key={tab}
          type="button"
          aria-pressed={active === tab}
          onClick={() => setActive(tab)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset ${
            active === tab
              ? "bg-brand-50 text-brand-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
