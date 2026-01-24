export default function HeroText() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Visual brand mark */}
      <div className="mb-4" aria-hidden="true">
        <span className="font-mono text-5xl sm:text-6xl md:text-7xl tracking-tight text-slate-900 dark:text-white">
          sort(<span className="text-blue-600 dark:text-blue-400">id</span>)
        </span>
      </div>

      {/* Accessible heading */}
      <h1 className="sr-only">Sortid</h1>

      {/* Subhead */}
      <p className="text-base sm:text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400 max-w-2xl mt-2 px-2">
        A list-making app for ranking movies, TV, anime, books, and podcasts — your taste, sorted.
      </p>
    </div>
  );
}
