"use client";

export function ReplyComposer() {
  return (
    <form
      aria-label="Write a reply"
      onSubmit={(e) => e.preventDefault()}
      className="border border-gray-400 rounded-xl p-4 mb-6"
    >
      <label htmlFor="thread-reply-textarea" className="block text-xs font-medium text-gray-600 mb-2">
        Write a reply
      </label>
      <textarea
        id="thread-reply-textarea"
        placeholder="Share your experience or answer this question..."
        className="w-full text-sm text-gray-700 placeholder-gray-500 resize-none border-0 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-inset rounded-lg min-h-[80px]"
        rows={3}
      />
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-600">
          Be helpful, specific, and respectful
        </p>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
        >
          <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
          Reply
        </button>
      </div>
    </form>
  );
}
