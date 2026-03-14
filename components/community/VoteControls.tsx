"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/utils";

interface VoteControlsProps {
  upvotes: number;
  downvotes: number;
  helpfulCount?: number;
  layout?: "vertical" | "horizontal";
  size?: "sm" | "md";
}

export function VoteControls({
  upvotes,
  downvotes,
  helpfulCount,
  layout = "horizontal",
  size = "sm",
}: VoteControlsProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);

  const netVotes = currentUpvotes - currentDownvotes;

  const handleVote = (type: "up" | "down") => {
    if (vote === type) {
      // Undo vote
      setVote(null);
      if (type === "up") setCurrentUpvotes((v) => v - 1);
      else setCurrentDownvotes((v) => v - 1);
    } else {
      // Change or set vote
      if (vote === "up") setCurrentUpvotes((v) => v - 1);
      if (vote === "down") setCurrentDownvotes((v) => v - 1);
      setVote(type);
      if (type === "up") setCurrentUpvotes((v) => v + 1);
      else setCurrentDownvotes((v) => v + 1);
    }
  };

  const buttonSize = size === "sm" ? "w-7 h-7 text-sm" : "w-9 h-9 text-base";
  const scoreSize = size === "sm" ? "text-sm" : "text-base";

  if (layout === "vertical") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={() => handleVote("up")}
          className={`${buttonSize} flex items-center justify-center rounded-lg transition-colors ${
            vote === "up"
              ? "bg-brand-50 text-brand-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          }`}
          aria-label="Upvote"
        >
          ▲
        </button>
        <span className={`${scoreSize} font-semibold ${netVotes > 0 ? "text-brand-600" : netVotes < 0 ? "text-red-500" : "text-gray-500"}`}>
          {formatNumber(netVotes)}
        </span>
        <button
          onClick={() => handleVote("down")}
          className={`${buttonSize} flex items-center justify-center rounded-lg transition-colors ${
            vote === "down"
              ? "bg-red-50 text-red-500"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          }`}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg">
        <button
          onClick={() => handleVote("up")}
          className={`${buttonSize} flex items-center justify-center rounded-l-lg transition-colors ${
            vote === "up"
              ? "bg-brand-50 text-brand-600"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
          aria-label="Upvote"
        >
          ▲
        </button>
        <span className={`${scoreSize} font-semibold px-1.5 ${netVotes > 0 ? "text-brand-600" : netVotes < 0 ? "text-red-500" : "text-gray-500"}`}>
          {formatNumber(netVotes)}
        </span>
        <button
          onClick={() => handleVote("down")}
          className={`${buttonSize} flex items-center justify-center rounded-r-lg transition-colors ${
            vote === "down"
              ? "bg-red-50 text-red-500"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>
      {helpfulCount !== undefined && helpfulCount > 0 && (
        <span className="text-xs text-gray-400">
          {helpfulCount} found helpful
        </span>
      )}
    </div>
  );
}
