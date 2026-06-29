export default function ProductLoading() {
  return (
    <div role="status" aria-label="Loading product page" aria-busy="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-2 bg-gray-100 rounded" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-2 bg-gray-100 rounded" />
        <div className="h-3 w-40 bg-gray-200 rounded" />
      </div>

      {/* Header */}
      <div className="mb-10 space-y-4">
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-9 w-80 bg-gray-200 rounded" />
        <div className="h-4 w-full max-w-xl bg-gray-100 rounded" />
        <div className="h-4 w-2/3 bg-gray-100 rounded" />
        {/* Score row */}
        <div className="flex items-center gap-6 mt-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="h-28 bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
