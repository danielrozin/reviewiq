"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCompare } from "@/lib/context/CompareContext";
import { cn, getScoreBgColor } from "@/lib/utils";

export function ComparisonTray() {
  const { items, remove, clear } = useCompare();
  const prevItemsRef = useRef(items);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const prev = prevItemsRef.current;
    if (prev.length < items.length) {
      const added = items.find((p) => !prev.some((q) => q.id === p.id));
      if (added) setAnnouncement(`${added.name} added to comparison (${items.length} of 4)`);
    } else if (prev.length > items.length) {
      const removed = prev.find((p) => !items.some((q) => q.id === p.id));
      if (removed) setAnnouncement(`${removed.name} removed from comparison (${items.length} of 4)`);
    }
    prevItemsRef.current = items;
  }, [items]);

  const compareUrl = `/compare?ids=${items.map((p) => p.id).join(",")}`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</span>
      {items.length > 0 && <div
      role="region"
      aria-label="Product comparison tray"
      className="motion-safe:animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Compare ({items.length}/4)
              </span>
            </div>
            <button
              type="button"
              onClick={clear}
              aria-label="Clear all products from comparison tray"
              className="min-h-[44px] flex items-center px-2 text-xs text-gray-600 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 rounded"
            >
              Clear all
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Product chips */}
            <ul role="list" className="flex-1 flex items-center gap-2 overflow-x-auto overscroll-x-contain scrollbar-thin list-none p-0 m-0" aria-label="Products selected for comparison">
              {items.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 shrink-0"
                >
                  <div
                    role="img"
                    aria-label={`SmartScore: ${product.smartScore}`}
                    className={cn(
                      "w-6 h-6 rounded-md text-white flex items-center justify-center text-xs font-bold shrink-0",
                      getScoreBgColor(product.smartScore)
                    )}
                  >
                    <span aria-hidden="true">{product.smartScore}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {product.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={`Remove ${product.name} from comparison`}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-gray-600 hover:text-red-600 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
                  >
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
                <li
                  key={`empty-${i}`}
                  aria-hidden="true"
                  className="w-[140px] h-[42px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center shrink-0"
                >
                  <span className="text-xs text-gray-500">+ Add product</span>
                </li>
              ))}
            </ul>

            {/* Compare Now CTA */}
            <Link
              href={compareUrl}
              aria-disabled={items.length < 2}
              tabIndex={items.length < 2 ? -1 : undefined}
              aria-label={items.length >= 2 ? `Compare Now: ${items.map(p => p.name).join(" and ")}` : "Compare Now — add at least 2 products first"}
              onClick={(e) => { if (items.length < 2) e.preventDefault(); }}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold motion-safe:transition-all",
                items.length >= 2
                  ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
                  : "bg-gray-100 text-gray-400 pointer-events-none"
              )}
            >
              Compare Now
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {items.length < 2 && (
            <p className="text-xs text-gray-600 mt-2">
              Add at least 2 products to compare
            </p>
          )}
        </div>
      </div>
    </div>}</div>
  );
}
