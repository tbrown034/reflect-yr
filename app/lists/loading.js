// app/lists/loading.js
export default function ListsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 px-1 border-b border-gray-200 dark:border-gray-700">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
            ></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse border-l-4 border-blue-500 dark:border-blue-400"
          >
            <div className="p-4 flex items-center">
              <div className="shrink-0 w-16 h-20 bg-gray-300 dark:bg-gray-600 rounded mr-4"></div>
              <div className="grow">
                <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="shrink-0 ml-4">
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
