// app/(media)/movies/[id]/loading.js
export default function MovieDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex animate-pulse">
          {/* Poster Placeholder */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative w-full aspect-2/3 md:rounded-l-xl overflow-hidden bg-gray-300 dark:bg-gray-600"></div>
          </div>

          {/* Details Placeholder */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>

            <div className="mb-4">
              <div className="h-5 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>

            <div className="mb-6">
              <div className="h-7 w-40 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-5 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-5 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>

            <div className="mb-6">
              <div className="h-7 w-40 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded-full"
                  ></div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-10 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-10 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
