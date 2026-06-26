export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
