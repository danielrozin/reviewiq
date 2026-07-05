"use client";

import { useState, useRef } from "react";
import type React from "react";
import { ThreadCard } from "@/components/community/ThreadCard";
import type { DiscussionThread } from "@/types";

type SortTab = "Trending" | "Recent" | "Top";

export function SortableDiscussions({
  trending,
  recent,
  top,
}: {
  trending: DiscussionThread[];
  recent: DiscussionThread[];
  top: DiscussionThread[];
}) {
  const [activeTab, setActiveTab] = useState<SortTab>("Trending");
  const tabKeys: SortTab[] = ["Trending", "Recent", "Top"];
  const radioGroupRef = useRef<HTMLDivElement>(null);

  function handleRadioKeyDown(e: React.KeyboardEvent) {
    const idx = tabKeys.indexOf(activeTab);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = tabKeys[(idx + 1) % tabKeys.length];
      setActiveTab(next);
      (radioGroupRef.current?.querySelector(`[data-key="${next}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = tabKeys[(idx - 1 + tabKeys.length) % tabKeys.length];
      setActiveTab(prev);
      (radioGroupRef.current?.querySelector(`[data-key="${prev}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveTab(tabKeys[0]);
      (radioGroupRef.current?.querySelector(`[data-key="${tabKeys[0]}"]`) as HTMLButtonElement)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = tabKeys[tabKeys.length - 1];
      setActiveTab(last);
      (radioGroupRef.current?.querySelector(`[data-key="${last}"]`) as HTMLButtonElement)?.focus();
    }
  }

  const tabs: { key: SortTab; icon: React.ReactNode }[] = [
    {
      key: "Trending",
      icon: (
        <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.387Z" />
        </svg>
      ),
    },
    {
      key: "Recent",
      icon: (
        <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      key: "Top",
      icon: (
        <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      ),
    },
  ];
  const threads = activeTab === "Trending" ? trending : activeTab === "Recent" ? recent : top;

  return (
    <section data-speakable="community-discussions" aria-labelledby="sortable-discussions-heading">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <h2 id="sortable-discussions-heading" className="text-lg font-semibold text-gray-900">{activeTab} Discussions</h2>
        </div>
        <div ref={radioGroupRef} role="radiogroup" aria-label="Sort discussions by" className="flex items-center gap-1 bg-gray-50 rounded-xl p-1" onKeyDown={handleRadioKeyDown}>
          {tabs.map(({ key, icon }) => (
            <button
              key={key}
              data-key={key}
              type="button"
              role="radio"
              aria-checked={activeTab === key}
              tabIndex={activeTab === key ? 0 : -1}
              aria-controls="sortable-discussion-list"
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-3 min-h-[44px] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
                activeTab === key
                  ? "bg-white text-brand-600 shadow-sm border border-gray-100"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              {icon}
              {key}
            </button>
          ))}
        </div>
      </div>

      <div id="sortable-discussion-list" role="list" aria-live="polite" aria-label={`${activeTab} discussions`} className="space-y-3">
        {threads.map((thread) => (
          <div role="listitem" key={thread.id}>
            <ThreadCard thread={thread} />
          </div>
        ))}
      </div>
    </section>
  );
}
