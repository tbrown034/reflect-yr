// components/ui/skeletons/ListsPageSkeleton.jsx
// Skeleton loading state for the My Lists page

export default function ListsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-l-4 border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 flex items-center">
              {/* Poster skeleton */}
              <div className="shrink-0 mr-4">
                <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              {/* Content skeleton */}
              <div className="grow">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
