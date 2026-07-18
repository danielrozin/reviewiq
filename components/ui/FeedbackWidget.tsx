"use client";

import { useState, useEffect, useRef } from "react";

type State = "idle" | "submitted" | "expanding";

interface FeedbackWidgetProps {
  context?: string;
  className?: string;
}

export function FeedbackWidget({ context = "page", className = "" }: FeedbackWidgetProps) {
  const [state, setState] = useState<State>("idle");
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [comment, setComment] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // WCAG 2.4.3 — move focus to textarea when the "No" form expands so keyboard
  // and screen-reader users discover the newly-appeared interactive content.
  useEffect(() => {
    if (state === "expanding") {
      textareaRef.current?.focus();
    }
  }, [state]);

  function handleVote(v: "yes" | "no") {
    setVote(v);
    if (v === "yes") {
      setState("submitted");
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful: true, context }),
      }).catch(() => {});
    } else {
      setState("expanding");
    }
  }

  function handleSubmit() {
    setState("submitted");
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpful: false, comment, context }),
    }).catch(() => {});
  }

  if (state === "submitted") {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`} role="status" aria-live="polite">
        <svg aria-hidden="true" className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">Was this helpful?</span>
        <div role="group" aria-label="Was this helpful?" className="flex gap-2">
          <button
            type="button"
            onClick={() => handleVote("yes")}
            aria-pressed={vote === "yes"}
            className={`inline-flex items-center gap-1.5 px-3 min-h-[44px] touch-manipulation text-sm font-medium rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${
              vote === "yes"
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleVote("no")}
            aria-pressed={vote === "no"}
            className={`inline-flex items-center gap-1.5 px-3 min-h-[44px] touch-manipulation text-sm font-medium rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${
              vote === "no"
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            <svg aria-hidden="true" className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
            No
          </button>
        </div>
      </div>

      {state === "expanding" && (
        <div className="space-y-2">
          <label htmlFor="feedback-comment" className="block text-sm text-gray-600">
            What could be improved?
          </label>
          <textarea
            ref={textareaRef}
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what was missing or unclear…"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setState("submitted")}
              className="px-3 min-h-[44px] touch-manipulation text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded-xl"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 min-h-[44px] touch-manipulation text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
            >
              Send feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
