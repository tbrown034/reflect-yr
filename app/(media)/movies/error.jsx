"use client";

// app/(media)/movies/error.jsx
// Error boundary for the movies listing page

import { useEffect } from "react";
import Link from "next/link";
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon, FilmIcon } from "@heroicons/react/24/solid";

export default function MoviesError({ error, reset }) {
  useEffect(() => {
    console.error("[MoviesError] Error loading movies:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <FilmIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Unable to Load Movies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't fetch the movie data. This might be a temporary issue with our data provider.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <HomeIcon className="h-5 w-5" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
