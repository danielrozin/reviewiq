"use client";

import { useState } from "react";

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
      <span className="text-xs text-gray-400 transition-all duration-200">
        {voted !== null
          ? "Thanks for your feedback!"
          : helpfulCount > 0
            ? `${helpfulCount} found this helpful`
            : "Was this helpful?"}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleVote("helpful")}
          disabled={loading}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
            voted === "helpful"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent"
          } disabled:opacity-50`}
          aria-label="Mark as helpful"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
          </svg>
          Yes
        </button>
        <button
          onClick={() => handleVote("not_helpful")}
          disabled={loading}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
            voted === "not_helpful"
              ? "bg-red-50 text-red-500 border border-red-200"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent"
          } disabled:opacity-50`}
          aria-label="Mark as not helpful"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
          </svg>
          No
        </button>
      </div>
    </div>
  );
}
