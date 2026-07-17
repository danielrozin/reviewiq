"use client";

import { useState, useRef } from "react";

const SORTS = ["Top", "Recent", "Verified"] as const;
type Sort = typeof SORTS[number];

export function ReplySortButtons() {
  const [active, setActive] = useState<Sort>("Top");
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = SORTS.indexOf(active);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = SORTS[(idx + 1) % SORTS.length];
      setActive(next);
      (groupRef.current?.querySelector(`[data-key="${next}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = SORTS[(idx - 1 + SORTS.length) % SORTS.length];
      setActive(prev);
      (groupRef.current?.querySelector(`[data-key="${prev}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(SORTS[0]);
      (groupRef.current?.querySelector(`[data-key="${SORTS[0]}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = SORTS[SORTS.length - 1];
      setActive(last);
      (groupRef.current?.querySelector(`[data-key="${last}"]`) as HTMLButtonElement)?.focus();
    }
  }

  return (
    <div ref={groupRef} role="radiogroup" aria-label="Sort replies by" className="flex items-center gap-1" onKeyDown={handleKeyDown}>
      {SORTS.map((tab) => (
        <button
          key={tab}
          data-key={tab}
          type="button"
          role="radio"
          aria-checked={active === tab}
          tabIndex={active === tab ? 0 : -1}
          onClick={() => setActive(tab)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset ${
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
