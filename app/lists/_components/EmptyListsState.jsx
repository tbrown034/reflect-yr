"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ListBulletIcon,
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

/**
 * EmptyListsState - Enhanced empty state with visual appeal and clear CTAs
 */
export default function EmptyListsState({ activeTab = "all" }) {
  const getIcon = () => {
    switch (activeTab) {
      case "movies":
        return FilmIcon;
      case "tv":
        return TvIcon;
      case "books":
        return BookOpenIcon;
      case "podcasts":
        return MicrophoneIcon;
      case "recs":
        return SparklesIcon;
      default:
        return ListBulletIcon;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case "movies":
        return "No Movie Lists Yet";
      case "tv":
        return "No TV Show Lists Yet";
      case "books":
        return "No Book Lists Yet";
      case "podcasts":
        return "No Podcast Lists Yet";
      case "recs":
        return "No Recommendations Yet";
      default:
        return "Your Lists Journey Begins";
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case "recs":
        return "Get personalized recommendations based on your existing lists.";
      default:
        return "Create ranked lists of your favorite movies, TV shows, books, and podcasts. Share them with friends and see how your taste compares.";
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center"
    >
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 sm:p-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4 sm:mb-6"
      >
        <Icon className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 dark:text-blue-400" />
      </motion.div>

      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
        {getTitle()}
      </h3>

      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mb-6 sm:mb-8">
        {getSubtitle()}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium text-sm sm:text-base"
        >
          <PlusIcon className="h-5 w-5" />
          Create Your First List
        </Link>

        {activeTab !== "recs" && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 text-sm"
            >
              <FilmIcon className="h-4 w-4 text-blue-500" />
              Movies
            </Link>
            <Link
              href="/tv"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 text-sm"
            >
              <TvIcon className="h-4 w-4 text-purple-500" />
              TV Shows
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 text-sm"
            >
              <BookOpenIcon className="h-4 w-4 text-green-500" />
              Books
            </Link>
            <Link
              href="/podcasts"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 text-sm"
            >
              <MicrophoneIcon className="h-4 w-4 text-orange-500" />
              Podcasts
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
