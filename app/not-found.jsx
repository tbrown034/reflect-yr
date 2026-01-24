// app/not-found.jsx
// Custom 404 page for the application

import Link from "next/link";
import { MagnifyingGlassIcon, HomeIcon, FilmIcon } from "@heroicons/react/24/solid";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-gray-200 dark:text-gray-700 mb-2">
            404
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto -mt-12">
            <MagnifyingGlassIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            Go Home
          </Link>

          <Link
            href="/movies"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FilmIcon className="h-5 w-5" />
            Browse Movies
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/movies" className="text-blue-600 dark:text-blue-400 hover:underline">
              Movies
            </Link>
            <Link href="/tv" className="text-blue-600 dark:text-blue-400 hover:underline">
              TV Shows
            </Link>
            <Link href="/lists" className="text-blue-600 dark:text-blue-400 hover:underline">
              My Lists
            </Link>
            <Link href="/create" className="text-blue-600 dark:text-blue-400 hover:underline">
              Create List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
