export default function PodcastsLoading() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 max-w-7xl">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-full md:w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Grid skeleton - square aspect ratio for podcasts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md"
          >
            {/* Artwork skeleton - square */}
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
            {/* Content skeleton */}
            <div className="p-3 sm:p-4 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
