// app/create/loading.jsx
// Loading skeleton for the Create List page

export default function CreateListLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header skeleton */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-blue-200 dark:bg-blue-900 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - List Builder */}
          <div className="space-y-6">
            {/* Category Selection skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* List Details skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="space-y-4">
                <div>
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
                <div>
                  <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
                <div>
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>

            {/* Theme Selection skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Selected Items skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 animate-pulse" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Column - Add Items */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Tabs skeleton */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1 h-12 bg-gray-100 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-600 animate-pulse" />
              </div>

              <div className="p-4">
                {/* Search input skeleton */}
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4" />

                {/* Search results skeleton */}
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg"
                    >
                      <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="grow">
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                        <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
