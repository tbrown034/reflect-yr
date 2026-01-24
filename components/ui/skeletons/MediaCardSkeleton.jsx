// components/ui/skeletons/MediaCardSkeleton.jsx
// Skeleton loading state for media cards

export default function MediaCardSkeleton({ count = 4 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <li key={i} className="h-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden h-full flex flex-col">
            {/* Image skeleton */}
            <div className="relative aspect-2/3 w-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

            {/* Gradient bar skeleton */}
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700" />

            {/* Content skeleton */}
            <div className="p-5 grow flex flex-col gap-2">
              {/* Title */}
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              {/* Year */}
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              {/* Description lines */}
              <div className="space-y-2 mt-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </>
  );
}
