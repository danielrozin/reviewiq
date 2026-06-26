"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/types";
import { cn } from "@/lib/utils";

interface FAQSectionProps {
  items: FAQItem[];
}

export function FAQSection({ items }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section data-speakable="faq-answer">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Frequently Asked Questions
      </h2>
      <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm font-medium text-gray-900 pr-4 group-hover:text-brand-700 transition-colors">
                  {item.question}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "shrink-0 text-gray-400 transition-transform duration-200",
                    isOpen && "rotate-180 text-brand-500"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isOpen ? "max-h-96" : "max-h-0"
                )}
              >
                <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
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
