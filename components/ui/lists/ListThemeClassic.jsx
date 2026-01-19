"use client";

import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const LOG_PREFIX = "[ListThemeClassic]";

/**
 * Classic list theme - numbered list with posters, ratings, and comments
 */
export default function ListThemeClassic({
  list,
  accentColor = "#3B82F6",
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  console.log(`${LOG_PREFIX} Rendering list: ${list?.title} with ${list?.items?.length} items`);

  if (!list || !list.items) {
    return <div className="text-gray-500">No list data</div>;
  }

  const getYear = (item) => {
    if (item.release_date) return item.release_date.split("-")[0];
    if (item.first_air_date) return item.first_air_date.split("-")[0];
    if (item.year) return item.year;
    return null;
  };

  const renderStars = (rating, itemId) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = rating && i <= rating;
      stars.push(
        <button
          key={i}
          onClick={() => isEditable && onUpdateRating?.(itemId, i)}
          disabled={!isEditable}
          className={`${isEditable ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          {isFilled ? (
            <StarIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarOutline className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: accentColor }}
        >
          {list.title}
        </h1>
        {list.description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg italic">
            {list.description}
          </p>
        )}
        {list.year && (
          <span className="inline-block mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium">
            {list.year}
          </span>
        )}
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {list.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Rank */}
            <div
              className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white"
              style={{ backgroundColor: accentColor }}
            >
              {item.rank || index + 1}
            </div>

            {/* Poster */}
            <div className="shrink-0 w-16 h-24 relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              {item.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                  alt={item.title || item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Content */}
            <div className="grow min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {item.title || item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getYear(item)}
                    {item.vote_average && (
                      <span className="ml-2">
                        TMDB: {item.vote_average.toFixed(1)}
                      </span>
                    )}
                  </p>
                </div>

                {/* User Rating */}
                <div className="flex items-center gap-0.5">
                  {renderStars(item.userRating, item.id)}
                </div>
              </div>

              {/* Comment */}
              {isEditable ? (
                <textarea
                  value={item.comment || ""}
                  onChange={(e) => onUpdateComment?.(item.id, e.target.value)}
                  placeholder="Add your thoughts..."
                  className="mt-2 w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              ) : (
                item.comment && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm italic">
                    "{item.comment}"
                  </p>
                )
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
