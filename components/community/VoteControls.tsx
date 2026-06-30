"use client";

import { useState, useEffect, useCallback } from "react";
import { formatNumber } from "@/lib/utils";
import { trackVoteCast } from "@/lib/tracking/analytics";

interface VoteControlsProps {
  itemId: string;
  itemType?: "thread" | "comment";
  upvotes: number;
  downvotes: number;
  helpfulCount?: number;
  layout?: "vertical" | "horizontal";
  size?: "sm" | "md";
}

function getStoredVote(itemId: string): "up" | "down" | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(`vote_${itemId}`);
  return stored === "up" || stored === "down" ? stored : null;
}

export function VoteControls({
  itemId,
  itemType = "thread",
  upvotes,
  downvotes,
  helpfulCount,
  layout = "horizontal",
  size = "sm",
}: VoteControlsProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);

  useEffect(() => {
    setVote(getStoredVote(itemId));
  }, [itemId]);

  const netVotes = currentUpvotes - currentDownvotes;

  const handleVote = useCallback((type: "up" | "down") => {
    let newVote: "up" | "down" | null;
    if (vote === type) {
      newVote = null;
      if (type === "up") setCurrentUpvotes((v) => v - 1);
      else setCurrentDownvotes((v) => v - 1);
    } else {
      if (vote === "up") setCurrentUpvotes((v) => v - 1);
      if (vote === "down") setCurrentDownvotes((v) => v - 1);
      newVote = type;
      if (type === "up") setCurrentUpvotes((v) => v + 1);
      else setCurrentDownvotes((v) => v + 1);
    }
    setVote(newVote);

    // Persist to localStorage and track
    if (newVote) {
      localStorage.setItem(`vote_${itemId}`, newVote);
      trackVoteCast(itemType, newVote);
    } else {
      localStorage.removeItem(`vote_${itemId}`);
    }

    // Ready for backend API when available:
    // fetch("/api/votes", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ itemId, itemType, vote: newVote }),
    // }).catch(() => {});
  }, [vote, itemId, itemType]);

  const buttonSize = size === "sm" ? "w-11 h-11 sm:w-7 sm:h-7 text-sm touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1" : "w-11 h-11 sm:w-9 sm:h-9 text-base touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1";
  const scoreSize = size === "sm" ? "text-sm" : "text-base";

  const UpIcon = () => (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
  const DownIcon = () => (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );

  if (layout === "vertical") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={() => handleVote("up")}
          aria-pressed={vote === "up"}
          aria-label="Upvote"
          className={`${buttonSize} flex items-center justify-center rounded-lg transition-colors ${
            vote === "up"
              ? "bg-brand-50 text-brand-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          }`}
        >
          <UpIcon />
        </button>
        <span
          aria-label={`${formatNumber(netVotes)} net votes`}
          className={`${scoreSize} font-semibold tabular-nums ${netVotes > 0 ? "text-brand-600" : netVotes < 0 ? "text-red-600" : "text-gray-500"}`}
        >
          {formatNumber(netVotes)}
        </span>
        <button
          type="button"
          onClick={() => handleVote("down")}
          aria-pressed={vote === "down"}
          aria-label="Downvote"
          className={`${buttonSize} flex items-center justify-center rounded-lg transition-colors ${
            vote === "down"
              ? "bg-red-50 text-red-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          }`}
        >
          <DownIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg">
        <button
          type="button"
          onClick={() => handleVote("up")}
          aria-pressed={vote === "up"}
          aria-label="Upvote"
          className={`${buttonSize} flex items-center justify-center rounded-l-lg transition-colors ${
            vote === "up"
              ? "bg-brand-50 text-brand-600"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
        >
          <UpIcon />
        </button>
        <span
          aria-label={`${formatNumber(netVotes)} net votes`}
          className={`${scoreSize} font-semibold tabular-nums px-1.5 ${netVotes > 0 ? "text-brand-600" : netVotes < 0 ? "text-red-600" : "text-gray-500"}`}
        >
          {formatNumber(netVotes)}
        </span>
        <button
          type="button"
          onClick={() => handleVote("down")}
          aria-pressed={vote === "down"}
          aria-label="Downvote"
          className={`${buttonSize} flex items-center justify-center rounded-r-lg transition-colors ${
            vote === "down"
              ? "bg-red-50 text-red-600"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
        >
          <DownIcon />
        </button>
      </div>
      {helpfulCount !== undefined && helpfulCount > 0 && (
        <span aria-label={`${helpfulCount} ${helpfulCount === 1 ? "person" : "people"} found this helpful`} className="text-xs text-gray-400" aria-live="polite">
          {helpfulCount} found helpful
        </span>
      )}
    </div>
  );
}
