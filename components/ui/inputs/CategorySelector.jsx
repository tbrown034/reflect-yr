"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";
import {
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { getAllCategories } from "@/library/api/providers/types";

const LOG_PREFIX = "[CategorySelector]";

// Map category icons
const categoryIcons = {
  movie: FilmIcon,
  tv: TvIcon,
  book: BookOpenIcon,
  podcast: MicrophoneIcon,
  custom: PencilSquareIcon,
};

// Category descriptions for the selector
const categoryDescriptions = {
  movie: "Films from any year",
  tv: "Television series",
  book: "Books and literature",
  podcast: "Podcasts and shows",
  custom: "Create your own",
};

export default function CategorySelector({
  selectedCategory = "movie",
  onCategoryChange,
  disabled = false,
  showDescription = true,
  compact = false,
}) {
  console.log(`${LOG_PREFIX} Rendering with category: ${selectedCategory}`);

  // Filter out album (deferred) - only show movie, tv, book, podcast, custom
  const categories = getAllCategories().filter(
    (cat) => cat.id !== "album" && cat.id !== "anime" && cat.id !== "sports"
  );

  if (compact) {
    // Compact mode - horizontal pills
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id] || PencilSquareIcon;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => !disabled && onCategoryChange?.(category.id)}
              disabled={disabled}
              className={`
                inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-full text-sm font-medium
                transition-all min-h-[44px] sm:min-h-0
                ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Full mode - grid cards
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id] || PencilSquareIcon;
          const isSelected = selectedCategory === category.id;
          const description = categoryDescriptions[category.id] || category.name;

          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => !disabled && onCategoryChange?.(category.id)}
              disabled={disabled}
              className={`
                relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left min-h-[44px]
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Category Icon */}
              <div
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2
                  ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }
                `}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              {/* Category Name */}
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {category.name}
              </p>

              {/* Description */}
              {showDescription && (
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {description}
                </p>
              )}

              {/* Provider badge */}
              {category.provider !== "custom" && (
                <div className="mt-1 sm:mt-2">
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {category.hasImages ? "with images" : "text only"}
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
