// components/ui/skeletons/CategoryRowSkeleton.jsx
// Reusable skeleton for scrolling category rows

export default function CategoryRowSkeleton({ title = "Loading..." }) {
  return (
    <div className="w-full px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Scrolling posters skeleton */}
      <div className="flex gap-4 overflow-hidden rounded-xl py-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="shrink-0 w-28 sm:w-36">
            <div className="aspect-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
