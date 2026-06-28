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
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              Verified Owner
            </span>
          )}
          {comment.isTopAnswer && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
              <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>
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
          <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-brand-50">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              Reply
            </button>
            <button className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2.25a2.25 2.25 0 0 1 2.25 2.25v.094a2.25 2.25 0 0 0 2.25 2.25h9.372c1.399 0 2.361-1.37 1.866-2.682L19.5 3M3 3v18m0-18 1.5 13.5M21 3l-1.5 7.5M3 21h18" />
              </svg>
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
