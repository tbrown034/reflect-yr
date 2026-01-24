"use client";

// app/error.jsx
// Global error boundary for the entire application
// This catches any unhandled errors and displays a user-friendly message

import { useEffect } from "react";
import Link from "next/link";
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error for debugging (in production, send to error tracking service)
    console.error("[GlobalError] Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          We encountered an unexpected error while loading this page.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          {error?.message || "Please try again or return to the home page."}
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

        {/* Technical Details (collapsed by default) */}
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
