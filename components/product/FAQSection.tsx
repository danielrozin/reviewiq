"use client";

import { useState } from "react";
import type { FAQItem } from "@/types";
import { cn } from "@/lib/utils";

interface FAQSectionProps {
  items: FAQItem[];
}

export function FAQSection({ items }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-section-heading" data-speakable="faq-answer">
      <div className="flex items-center gap-2.5 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 id="faq-section-heading" className="text-lg font-semibold text-gray-900">
          Frequently Asked Questions
        </h2>
        <span className="ml-auto text-xs text-gray-600 font-medium tabular-nums">{items.length} questions</span>
      </div>
      <ul role="list" className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 list-none p-0 m-0">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          const panelId = `faq-panel-${i}`;
          const btnId = `faq-btn-${i}`;
          return (
            <li key={i} className={cn(isOpen && "bg-brand-50/40")}>
              <button
                id={btnId}
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 min-h-[44px] text-left transition-colors touch-manipulation group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600",
                  isOpen ? "hover:bg-brand-50/60" : "hover:bg-gray-50"
                )}
              >
                <span className={cn(
                  "text-sm font-medium pr-4 transition-colors",
                  isOpen ? "text-brand-700" : "text-gray-900 group-hover:text-brand-700"
                )}>
                  {item.question}
                </span>
                <svg
                  aria-hidden="true"
                  className={cn(
                    "w-4 h-4 shrink-0 motion-safe:transition-all duration-200",
                    isOpen ? "rotate-180 text-brand-600" : "text-gray-500"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                aria-hidden={isOpen ? undefined : true}
                className={cn(
                  "overflow-hidden motion-safe:transition-all duration-200",
                  isOpen ? "max-h-[32rem]" : "max-h-0"
                )}
              >
                <div className="px-5 pb-4 border-l-2 border-brand-200 ml-5">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
