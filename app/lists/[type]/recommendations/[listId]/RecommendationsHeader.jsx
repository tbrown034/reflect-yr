// app/lists/[type]/recommendations/[listId]/RecommendationsHeader.jsx
export default function RecommendationsHeader({ originalList, pageTypeLabel }) {
  const originalTitle =
    originalList?.title ||
    `My Top ${pageTypeLabel === "Movie" ? "Movies" : "TV Shows"}`;

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <div className="px-4 py-6 sm:px-6">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
          Recommendations
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Based on "{originalTitle}"
        </h1>
      </div>
    </div>
  );
}
