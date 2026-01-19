// app/(media)/movies/[id]/loading.jsx
export default function MovieDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Poster skeleton */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="aspect-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>

          {/* Details skeleton */}
          <div className="md:w-2/3 lg:w-3/4 p-6 space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />

            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>

            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />

            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
            </div>

            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
