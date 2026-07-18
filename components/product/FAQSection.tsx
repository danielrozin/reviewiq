"use client";

import { useState } from "react";
import type { FAQItem } from "@/types";
import { faqSchema } from "@/lib/schema/jsonld";

interface FAQSectionProps {
  items: FAQItem[];
}

export function FAQSection({ items }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(items)),
        }}
      />
      <h2 id="faq-heading" className="text-lg font-semibold text-gray-900 mb-4">
        Frequently Asked Questions
      </h2>
      <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
        {items.map((item, i) => {
          const btnId = `faq-btn-${i}`;
          const panelId = `faq-panel-${i}`;
          const isOpen = openIndex === i;
          return (
            <div key={i}>
              <button
                id={btnId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 pr-4">
                  {item.question}
                </span>
                <span aria-hidden="true" className="text-gray-400 shrink-0 text-lg">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                hidden={!isOpen}
                className={isOpen ? "px-5 pb-4" : undefined}
              >
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
