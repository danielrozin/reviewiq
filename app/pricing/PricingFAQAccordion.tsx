"use client";

import { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  faqs: FAQItem[];
}

export function PricingFAQAccordion({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ul role="list" className="space-y-3 list-none p-0 m-0">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        const btnId = `pricing-faq-btn-${i}`;
        const panelId = `pricing-faq-panel-${i}`;
        return (
          <li
            key={faq.q}
            className={`bg-white rounded-xl border transition-all ${
              isOpen ? "border-brand-200 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
            }`}
          >
            <button
              id={btnId}
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset"
            >
              <span className={`font-semibold text-sm sm:text-base ${isOpen ? "text-brand-700" : "text-gray-900"}`}>
                {faq.q}
              </span>
              <span aria-hidden="true" className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isOpen ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500"}`}>
                <svg
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="px-6 pb-5"
            >
              <p data-speakable="faq-answer" className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
