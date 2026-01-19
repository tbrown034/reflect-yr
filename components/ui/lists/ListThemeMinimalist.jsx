"use client";

import { motion } from "framer-motion";

const LOG_PREFIX = "[ListThemeMinimalist]";

/**
 * Minimalist theme - simple text-based list
 */
export default function ListThemeMinimalist({
  list,
  accentColor = "#3B82F6",
}) {
  console.log(`${LOG_PREFIX} Rendering: ${list?.title}`);

  if (!list || !list.items) {
    return <div className="text-gray-500">No list data</div>;
  }

  const getYear = (item) => {
    if (item.release_date) return item.release_date.split("-")[0];
    if (item.first_air_date) return item.first_air_date.split("-")[0];
    if (item.year) return item.year;
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto font-serif">
      {/* Header */}
      <header className="text-center mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-4xl font-light mb-3 text-gray-900 dark:text-white">
          {list.title}
        </h1>
        {list.year && (
          <p className="text-lg text-gray-500 dark:text-gray-400">
            — {list.year} —
          </p>
        )}
        {list.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-6 leading-relaxed">
            {list.description}
          </p>
        )}
      </header>

      {/* List */}
      <ol className="space-y-6">
        {list.items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <div className="flex items-baseline gap-4">
              {/* Number */}
              <span
                className="text-3xl font-light opacity-50"
                style={{ color: accentColor }}
              >
                {String(item.rank || index + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div className="grow">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                    {item.title || item.name}
                  </h3>
                  <span className="text-gray-400 dark:text-gray-500">
                    {getYear(item)}
                  </span>
                  {item.userRating && (
                    <span className="text-yellow-500 text-sm">
                      {"★".repeat(item.userRating)}
                    </span>
                  )}
                </div>

                {item.comment && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400 italic text-sm leading-relaxed">
                    {item.comment}
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            {index < list.items.length - 1 && (
              <div className="mt-6 border-b border-gray-100 dark:border-gray-800" />
            )}
          </motion.li>
        ))}
      </ol>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Created with ReflectYr
        </p>
      </footer>
    </div>
  );
}
