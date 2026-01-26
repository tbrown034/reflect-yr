// components/layout/footer/Footer.jsx
// Footer with visible grid design

import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-700">
      {/* Main footer grid */}
      <div className="max-w-5xl mx-auto">
        {/* Top section - 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
          {/* Brand column */}
          <div className="p-4 sm:p-6">
            <div className="flex items-baseline font-mono text-xl sm:text-2xl tracking-tight">
              <span className="text-slate-900 dark:text-white">sort</span>
              <span className="text-slate-500 dark:text-slate-400">(</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                id
              </span>
              <span className="text-slate-500 dark:text-slate-400">)</span>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Rank your favorites.
              <br />
              Share your taste.
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500 font-mono">
              v1.0.0
            </p>
          </div>

          {/* Links column */}
          <div className="p-4 sm:p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Navigation
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/create"
                className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Create a List
              </Link>
              <Link
                href="/movies"
                className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Browse Movies
              </Link>
              <Link
                href="/tv"
                className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Browse TV Shows
              </Link>
              <Link
                href="/lists"
                className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                My Lists
              </Link>
            </nav>
          </div>

          {/* About column */}
          <div className="p-4 sm:p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              About
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                About Sortid
              </Link>
              <a
                href="https://github.com/tbrown034/reflect-yr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                GitHub
              </a>
              <a
                href="mailto:trevorbrown.web@gmail.com"
                className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentYear}{" "}
            <span className="font-mono">
              sort(<span className="text-blue-600 dark:text-blue-400">id</span>)
            </span>
            . Built by{" "}
            <a
              href="https://trevorthewebdeveloper.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Trevor Brown
            </a>
            .
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Data from{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              TMDB
            </a>
            ,{" "}
            <a
              href="https://www.apple.com/itunes/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              iTunes
            </a>
            ,{" "}
            <a
              href="https://openlibrary.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Open Library
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
