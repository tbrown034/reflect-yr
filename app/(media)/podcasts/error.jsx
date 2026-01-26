"use client";

import { MicrophoneIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default function PodcastsError({ error, reset }) {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 max-w-7xl">
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MicrophoneIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load the podcasts. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
