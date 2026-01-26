// app/share/[code]/loading.jsx
// Loading skeleton for the Share page

export default function SharePageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Bar skeleton */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-10 w-20 bg-blue-200 dark:bg-blue-900 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* List Content skeleton */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* List header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* List items skeleton */}
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                {/* Rank */}
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />

                {/* Poster */}
                <div className="w-16 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse" />

                {/* Info */}
                <div className="grow">
                  <div className="h-5 w-48 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>

                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className="h-5 w-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse mb-4" />
          <div className="h-12 w-48 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-lg mx-auto animate-pulse" />
        </div>
      </main>
    </div>
  );
}
