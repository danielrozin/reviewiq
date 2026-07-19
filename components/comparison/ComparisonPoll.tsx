"use client";

import { useState, useEffect, useRef } from "react";
import type React from "react";

interface PollOption {
  id: string;
  label: string;
  votes?: number;
}

interface ComparisonPollProps {
  question?: string;
  options: PollOption[];
  pollKey: string;
  className?: string;
}

const STORAGE_KEY_PREFIX = "sr_poll_";

export function ComparisonPoll({
  question = "Which product do you prefer?",
  options,
  pollKey,
  className = "",
}: ComparisonPollProps) {
  const [voted, setVoted] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(options.map((o) => [o.id, o.votes ?? 0]))
  );
  const [mounted, setMounted] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${pollKey}`);
    if (stored) setVoted(stored);
  }, [pollKey]);

  function totalVotes() {
    return Object.values(votes).reduce((s, v) => s + v, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (hasVoted) return;
    const idx = options.findIndex((o) => o.id === (voted ?? options[0].id));
    const focusOption = (id: string) => {
      (groupRef.current?.querySelector(`[data-pollkey="${id}"]`) as HTMLButtonElement)?.focus();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = options[(idx + 1) % options.length];
      focusOption(next.id);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = options[(idx - 1 + options.length) % options.length];
      focusOption(prev.id);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusOption(options[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      focusOption(options[options.length - 1].id);
    }
  }

  function handleVote(optionId: string) {
    if (voted) return;
    setVoted(optionId);
    setVotes((prev) => ({ ...prev, [optionId]: (prev[optionId] ?? 0) + 1 }));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${pollKey}`, optionId);
    fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollKey, optionId }),
    }).catch(() => {});
  }

  const total = totalVotes();
  const hasVoted = mounted && voted !== null;

  return (
    <section
      aria-labelledby={`poll-heading-${pollKey}`}
      className={`bg-white border border-gray-100 rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
        <h3 id={`poll-heading-${pollKey}`} className="text-sm font-semibold text-gray-900">
          {question}
        </h3>
      </div>

      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={question}
        className="space-y-2.5"
        onKeyDown={handleKeyDown}
      >
        {options.map((option, optIdx) => {
          const pct = total > 0 ? Math.round(((votes[option.id] ?? 0) / total) * 100) : 0;
          const isWinner = hasVoted && pct === Math.max(...options.map((o) => total > 0 ? Math.round(((votes[o.id] ?? 0) / total) * 100) : 0));

          return (
            <div key={option.id} className="relative">
              <button
                type="button"
                role="radio"
                data-pollkey={option.id}
                onClick={() => !hasVoted && handleVote(option.id)}
                aria-checked={voted === option.id}
                aria-disabled={hasVoted || undefined}
                tabIndex={hasVoted ? -1 : (optIdx === 0 || voted === option.id ? 0 : -1)}
                aria-label={hasVoted ? `${option.label}: ${pct}% of votes${isWinner ? " — leading" : ""}` : `Vote for ${option.label}`}
                className={`relative w-full text-left px-4 min-h-[44px] touch-manipulation text-sm font-medium rounded-xl border overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${
                  hasVoted
                    ? voted === option.id
                      ? "border-brand-400 bg-brand-50 text-brand-700 cursor-default"
                      : "border-gray-100 bg-gray-50 text-gray-500 cursor-default"
                    : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700"
                }`}
              >
                {hasVoted && (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 motion-safe:transition-all duration-500 rounded-xl ${
                      voted === option.id ? "bg-brand-100" : "bg-gray-100"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <span className="relative flex items-center justify-between gap-2 py-2.5">
                  <span className="flex items-center gap-2">
                    {voted === option.id && (
                      <svg aria-hidden="true" className="w-4 h-4 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                    {option.label}
                  </span>
                  {hasVoted && (
                    <span className={`inline-flex items-center gap-0.5 shrink-0 ${isWinner ? "text-brand-600 font-bold" : "text-gray-600 font-semibold"}`}>
                      {isWinner && (
                        <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                        </svg>
                      )}
                      <span className="text-xs">{pct}%</span>
                    </span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Live region always in DOM so AT registers it before the first vote is cast (WCAG 4.1.3) */}
      <p className="mt-3 text-xs text-gray-600 text-right" aria-live="polite" aria-atomic="true">
        {hasVoted ? `${total.toLocaleString()} ${total === 1 ? "vote" : "votes"} cast` : ""}
      </p>

      {!hasVoted && !mounted && (
        <p className="sr-only">Loading poll…</p>
      )}
    </section>
  );
}
