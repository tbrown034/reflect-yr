// components/ui/skeletons/MediaDetailSkeleton.jsx
// Skeleton loading state for media detail pages

export default function MediaDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Poster skeleton */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative w-full aspect-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>

          {/* Details skeleton */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            {/* Title */}
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />

            {/* Metadata row */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Genres */}
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />

            {/* Overview title */}
            <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />

            {/* Overview text */}
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Cast title */}
            <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />

            {/* Cast badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
