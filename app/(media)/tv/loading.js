export default function TvShowsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        <div className="w-full md:w-48 h-14 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden h-96 animate-pulse"
          >
            <div className="relative aspect-2/3 w-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-1.5 w-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="p-5">
              <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
