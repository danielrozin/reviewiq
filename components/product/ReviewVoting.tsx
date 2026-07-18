"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ReviewVotingProps {
  reviewId: string;
  initialHelpfulCount: number;
}

export function ReviewVoting({ reviewId, initialHelpfulCount }: ReviewVotingProps) {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [voted, setVoted] = useState<"helpful" | "not_helpful" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVote(type: "helpful" | "not_helpful") {
    if (loading) return;
    setLoading(true);

    try {
      // Get or create anonymous session ID from cookie
      let sessionId = document.cookie
        .split("; ")
        .find((c) => c.startsWith("sr_voter_id="))
        ?.split("=")[1];

      if (!sessionId) {
        sessionId = crypto.randomUUID();
        document.cookie = `sr_voter_id=${sessionId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      }

      const voteType = type === "helpful" ? "helpful" : "downvote";

      // If clicking the same vote again, toggle off
      if (voted === type) {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: sessionId, voteType, reviewId }),
        });
        if (res.ok) {
          if (type === "helpful") setHelpfulCount((c) => c - 1);
          setVoted(null);
        }
      } else {
        // If switching vote, remove old vote first
        if (voted) {
          const oldVoteType = voted === "helpful" ? "helpful" : "downvote";
          await fetch("/api/vote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: sessionId, voteType: oldVoteType, reviewId }),
          });
          if (voted === "helpful") setHelpfulCount((c) => c - 1);
        }

        // Cast new vote
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: sessionId, voteType, reviewId }),
        });
        if (res.ok) {
          if (type === "helpful") setHelpfulCount((c) => c + 1);
          setVoted(type);
        }
      }
    } catch {
      // Silently fail on network errors
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400">
        {helpfulCount > 0
          ? `${helpfulCount} found this helpful`
          : "Was this helpful?"}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleVote("helpful")}
          disabled={loading}
          aria-pressed={voted === "helpful"}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
            voted === "helpful"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent"
          } disabled:opacity-50`}
          aria-label="Mark as helpful"
        >
          <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
          Yes
        </button>
        <button
          onClick={() => handleVote("not_helpful")}
          disabled={loading}
          aria-pressed={voted === "not_helpful"}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
            voted === "not_helpful"
              ? "bg-red-50 text-red-500 border border-red-200"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent"
          } disabled:opacity-50`}
          aria-label="Mark as not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" aria-hidden="true" />
          No
        </button>
      </div>
    </div>
  );
}
