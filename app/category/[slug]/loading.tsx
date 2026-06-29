import { CardSkeletonGrid } from "@/components/ui/CardSkeleton";

export default function CategoryLoading() {
  return (
    <div role="status" aria-label="Loading category page" aria-busy="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-2 bg-gray-100 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>

      {/* Hero */}
      <div className="mb-10 space-y-3">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="h-4 w-96 bg-gray-100 rounded" />
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-8 w-36 bg-gray-100 rounded-xl" />
      </div>

      <CardSkeletonGrid count={6} />
    </div>
  );
}
