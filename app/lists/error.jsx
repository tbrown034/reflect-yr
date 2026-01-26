"use client";

// app/lists/error.jsx
// Error boundary for the My Lists page

import { useEffect } from "react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

export default function ListsError({ error, reset }) {
  useEffect(() => {
    console.error("[ListsError] Error caught:", error);
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
          Couldn't Load Your Lists
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Something went wrong while loading your saved lists.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Your lists are stored locally. Try refreshing the page.
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

        {/* Create new list CTA */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Or start fresh with a new list
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Create New List
          </Link>
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
