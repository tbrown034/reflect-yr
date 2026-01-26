"use client";

// app/explore/error.jsx
// Error boundary for the Explore page

import { useEffect } from "react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

export default function ExploreError({ error, reset }) {
  useEffect(() => {
    console.error("[ExploreError] Error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Couldn't Load Explore
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Something went wrong while loading the explore page.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Try refreshing the page or check your connection.
        </p>

        {/* Action Buttons */}
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

        {/* Alternative: Browse specific categories */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Or try browsing directly:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/movies"
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
            >
              Movies
            </Link>
            <Link
              href="/tv"
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
            >
              TV Shows
            </Link>
          </div>
        </div>

        {/* Technical Details (dev only) */}
        {process.env.NODE_ENV === "development" && error?.stack && (
          <details className="mt-8 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              Technical Details
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto max-h-48 text-gray-700 dark:text-gray-300">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
