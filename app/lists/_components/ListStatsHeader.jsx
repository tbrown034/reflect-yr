"use client";

import { motion } from "framer-motion";
import {
  ListBulletIcon,
  FilmIcon,
  StarIcon,
  CalendarIcon,
  FireIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/solid";

const categoryIcons = {
  movie: FilmIcon,
  tv: TvIcon,
  book: BookOpenIcon,
  podcast: MicrophoneIcon,
};

/**
 * ListStatsHeader - Display aggregate stats at the top of the lists page
 */
export default function ListStatsHeader({ stats }) {
  const {
    totalLists,
    totalItems,
    avgRating,
    mostListedYear,
    hotTakesCount,
    categoryBreakdown = {},
  } = stats;

  // Don't render if no lists
  if (totalLists === 0) return null;

  const statItems = [
    {
      label: "Total Lists",
      value: totalLists,
      icon: ListBulletIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Items Ranked",
      value: totalItems,
      icon: FilmIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    ...(avgRating
      ? [
          {
            label: "Avg Rating",
            value: avgRating,
            icon: StarIcon,
            color: "text-yellow-500",
            bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
            suffix: "/5",
          },
        ]
      : []),
    ...(mostListedYear
      ? [
          {
            label: "Top Year",
            value: mostListedYear,
            icon: CalendarIcon,
            color: "text-green-500",
            bgColor: "bg-green-100 dark:bg-green-900/30",
          },
        ]
      : []),
    ...(hotTakesCount > 0
      ? [
          {
            label: "Hot Takes",
            value: hotTakesCount,
            icon: FireIcon,
            color: "text-orange-500",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 sm:mb-8"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md text-center"
          >
            <div
              className={`${stat.bgColor} w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mx-auto mb-2`}
            >
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
              {stat.suffix && (
                <span className="text-xs sm:text-sm font-normal text-gray-500">
                  {stat.suffix}
                </span>
              )}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Category breakdown */}
      {Object.keys(categoryBreakdown).length > 1 && (
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 justify-center">
          {Object.entries(categoryBreakdown).map(([category, count]) => {
            const Icon = categoryIcons[category] || ListBulletIcon;
            return (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-600 dark:text-gray-300"
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                {count} {category}
              </span>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
