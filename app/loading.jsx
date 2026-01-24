// app/loading.jsx
// Root loading skeleton - shows while the main page content is loading

export default function RootLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Hero Section Skeleton */}
      <div className="flex flex-col gap-6 justify-center items-center p-2 mt-4 mb-8">
        {/* Title skeleton */}
        <div className="h-12 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

        {/* Subtitle skeleton */}
        <div className="h-6 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

        {/* CTA buttons skeleton */}
        <div className="flex gap-4">
          <div className="h-12 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-12 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Category Row Skeletons */}
      {[1, 2, 3].map((row) => (
        <div key={row} className="mb-8 px-4 max-w-7xl mx-auto">
          {/* Row header */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Poster row */}
          <div className="flex gap-4 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="shrink-0 w-28 sm:w-36">
                <div className="aspect-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
