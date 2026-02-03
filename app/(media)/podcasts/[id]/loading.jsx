// app/(media)/podcasts/[id]/loading.jsx
export default function PodcastDetailLoading() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Artwork skeleton - Square for podcasts */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>

          {/* Details skeleton */}
          <div className="md:w-2/3 lg:w-3/4 p-4 sm:p-6 space-y-4">
            {/* Title */}
            <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />

            {/* Meta info row */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-5 sm:h-6 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>

            {/* Genre */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />

            {/* Categories section */}
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-28" />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-7 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                ))}
              </div>
            </div>

            {/* Apple Podcasts link */}
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40" />

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 sm:h-11 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
