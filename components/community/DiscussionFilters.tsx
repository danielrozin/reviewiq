"use client";

import { useState, useRef } from "react";
import type React from "react";
import type { ThreadType } from "@/types";
import { THREAD_TYPE_LABELS, THREAD_TYPE_COLORS } from "@/types";

interface DiscussionFiltersProps {
  onSortChange?: (sort: string) => void;
  onTypeFilter?: (type: ThreadType | null) => void;
  activeSort?: string;
  activeType?: ThreadType | null;
}

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "recent", label: "Most Recent" },
  { value: "most-voted", label: "Most Voted" },
  { value: "most-discussed", label: "Most Discussed" },
  { value: "verified-owners", label: "Verified Owners" },
];

const THREAD_TYPES: ThreadType[] = [
  "question",
  "discussion",
  "issue",
  "recommendation",
  "comparison",
  "long_term_update",
  "warning",
  "tip",
];

const TYPE_VALUES: (ThreadType | null)[] = [null, ...THREAD_TYPES];

export function DiscussionFilters({
  onSortChange,
  onTypeFilter,
  activeSort = "trending",
  activeType = null,
}: DiscussionFiltersProps) {
  const [sort, setSort] = useState(activeSort);
  const [typeFilter, setTypeFilter] = useState<ThreadType | null>(activeType);
  const sortGroupRef = useRef<HTMLDivElement>(null);
  const typeGroupRef = useRef<HTMLDivElement>(null);
  const sortValues = SORT_OPTIONS.map((o) => o.value);

  function handleSortKeyDown(e: React.KeyboardEvent) {
    const idx = sortValues.indexOf(sort);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = sortValues[(idx + 1) % sortValues.length];
      handleSort(next);
      (sortGroupRef.current?.querySelector(`[data-key="${next}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = sortValues[(idx - 1 + sortValues.length) % sortValues.length];
      handleSort(prev);
      (sortGroupRef.current?.querySelector(`[data-key="${prev}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      handleSort(sortValues[0]);
      (sortGroupRef.current?.querySelector(`[data-key="${sortValues[0]}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = sortValues[sortValues.length - 1];
      handleSort(last);
      (sortGroupRef.current?.querySelector(`[data-key="${last}"]`) as HTMLButtonElement)?.focus();
    }
  }

  const handleSort = (value: string) => {
    setSort(value);
    onSortChange?.(value);
  };

  const handleTypeFilter = (type: ThreadType | null) => {
    setTypeFilter(type);
    onTypeFilter?.(type);
  };

  function handleTypeKeyDown(e: React.KeyboardEvent) {
    const idx = TYPE_VALUES.indexOf(typeFilter);
    const focusType = (t: ThreadType | null) => {
      handleTypeFilter(t);
      const key = t ?? "all";
      (typeGroupRef.current?.querySelector(`[data-typekey="${key}"]`) as HTMLButtonElement)?.focus();
    };
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusType(TYPE_VALUES[(idx + 1) % TYPE_VALUES.length]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusType(TYPE_VALUES[(idx - 1 + TYPE_VALUES.length) % TYPE_VALUES.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusType(TYPE_VALUES[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      focusType(TYPE_VALUES[TYPE_VALUES.length - 1]);
    }
  }

  return (
    <div className="space-y-3">
      {/* Sort buttons — mutually exclusive, so radiogroup pattern */}
      <div ref={sortGroupRef} role="radiogroup" aria-label="Sort discussions by" className="flex items-center gap-1 overflow-x-auto pb-1" onKeyDown={handleSortKeyDown}>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            data-key={option.value}
            type="button"
            role="radio"
            aria-checked={sort === option.value}
            tabIndex={sort === option.value ? 0 : -1}
            onClick={() => handleSort(option.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
              sort === option.value
                ? "bg-brand-50 text-brand-600 border-brand-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-700 border-transparent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Type filter pills — single-select, so radiogroup pattern */}
      <div ref={typeGroupRef} role="radiogroup" aria-label="Filter by thread type" className="flex items-center gap-1.5 overflow-x-auto pb-1" onKeyDown={handleTypeKeyDown}>
        <button
          type="button"
          role="radio"
          data-typekey="all"
          aria-checked={typeFilter === null}
          tabIndex={typeFilter === null ? 0 : -1}
          onClick={() => handleTypeFilter(null)}
          className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
            typeFilter === null
              ? "bg-brand-600 text-white border-brand-600"
              : "text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          All
        </button>
        {THREAD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            role="radio"
            data-typekey={type}
            aria-checked={typeFilter === type}
            tabIndex={typeFilter === type ? 0 : -1}
            onClick={() => handleTypeFilter(type)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
              typeFilter === type
                ? THREAD_TYPE_COLORS[type]
                : "text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {THREAD_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
