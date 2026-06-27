"use client";

import type { Comment } from "@/types";
import { getUserById } from "@/data/users";
import { UserChip } from "./UserChip";
import { VoteControls } from "./VoteControls";

interface CommentThreadProps {
  comments: Comment[];
  depth?: number;
}

function SingleComment({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const author = getUserById(comment.authorId);
  const maxDepth = 3;
  const isNested = depth > 0;

  return (
    <div className={`${isNested ? "ml-6 pl-4 border-l-2 border-gray-100" : ""}`}>
      <div className={`group py-4 px-1 rounded-xl transition-colors hover:bg-gray-50/60 ${depth === 0 ? "border-b border-gray-50" : ""}`}>
        {/* Comment header */}
        <div className="flex items-center gap-2 mb-2">
          {author && <UserChip user={author} showTrustLevel size="sm" />}
          {comment.isOwnerVerified && (
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              Verified Owner
            </span>
          )}
          {comment.isTopAnswer && (
            <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
              Top Answer
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">{comment.createdAt}</span>
        </div>

        {/* Comment body */}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">
          {comment.body.split("\n").map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <span key={i}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="font-semibold text-gray-900">{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
                {i < comment.body.split("\n").length - 1 && <br />}
              </span>
            );
          })}
        </div>

        {/* Comment actions */}
        <div className="flex items-center gap-3">
          <VoteControls
            itemId={comment.id}
            itemType="comment"
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            helpfulCount={comment.helpfulCount}
            size="sm"
          />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-brand-50">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              Reply
            </button>
            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100">
              Report
            </button>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
        <div>
          {comment.replies.map((reply) => (
            <SingleComment key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({ comments }: CommentThreadProps) {
  // Sort: top answers first, then by upvotes
  const sorted = [...comments].sort((a, b) => {
    if (a.isTopAnswer && !b.isTopAnswer) return -1;
    if (!a.isTopAnswer && b.isTopAnswer) return 1;
    return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
  });

  return (
    <div className="divide-y divide-gray-50">
      {sorted.map((comment) => (
        <SingleComment key={comment.id} comment={comment} depth={0} />
      ))}
    </div>
  );
}
