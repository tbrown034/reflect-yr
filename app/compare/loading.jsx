// app/compare/loading.jsx
// Loading skeleton for the Compare page

export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse mb-2" />
          <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
        </div>

        {/* List selector skeleton */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        {/* Compare button skeleton */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-40 bg-blue-200 dark:bg-blue-900 rounded-lg animate-pulse" />
        </div>

        {/* Results skeleton */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="h-10 w-16 bg-gray-200 dark:bg-gray-600 rounded mx-auto animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Shared items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-10 h-14 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div className="grow">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
