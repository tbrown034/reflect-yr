// app/(media)/books/[id]/loading.jsx
export default function BookDetailLoading() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Cover skeleton - books use 2:3 aspect ratio */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="aspect-[2/3] bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 animate-pulse" />
          </div>

          {/* Details skeleton */}
          <div className="md:w-2/3 lg:w-3/4 p-4 sm:p-6 space-y-4">
            {/* Title */}
            <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />

            {/* Meta info row */}
            <div className="flex gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-5 sm:h-6 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>

            {/* Subjects section */}
            <div className="space-y-2 pt-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-7 w-16 sm:w-20 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse" />
                ))}
              </div>
            </div>

            {/* Languages section */}
            <div className="space-y-2 pt-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-36" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
            </div>

            {/* Link placeholder */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40 mt-4" />

            {/* Action buttons */}
            <div className="flex gap-2 sm:gap-3 pt-4">
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
