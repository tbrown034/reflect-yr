// components/layout/hero/HeroText.jsx
// Hero brand and tagline

export default function HeroText() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Visual brand mark */}
      <div className="mb-4" aria-hidden="true">
        <span className="font-mono text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none">
          <span className="text-slate-900 dark:text-white">sort</span>
          <span className="text-slate-500 dark:text-slate-400">(</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            id
          </span>
          <span className="text-slate-500 dark:text-slate-400">)</span>
        </span>
      </div>

      {/* Accessible heading */}
      <h1 className="sr-only">sort(id) - Rank Your Favorites</h1>

      {/* Tagline */}
      <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-600 dark:text-slate-400 max-w-2xl">
        Rank your favorites.
      </p>
    </div>
  );
}
