// app/explore/loading.jsx
// Loading skeleton for the Explore page

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header skeleton */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-28 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-lg animate-pulse" />
          </div>

          {/* Category tabs skeleton */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse shrink-0"
              />
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search bar skeleton */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="grow h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Results grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md"
            >
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
