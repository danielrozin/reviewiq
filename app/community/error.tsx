"use client";

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-md mx-auto text-center">
        <div aria-hidden="true" className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-red-600 text-2xl">!</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Community unavailable
        </h2>
        <p className="text-gray-600 mb-6">
          We had trouble loading the community section. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
