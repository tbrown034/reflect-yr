"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FilmIcon, TvIcon, BookOpenIcon, MicrophoneIcon, MusicalNoteIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { getImageUrl } from "./themeUtils";

const LOG_PREFIX = "[ListThemePosterGrid]";

const CATEGORY_ICONS = {
  movie: FilmIcon,
  tv: TvIcon,
  book: BookOpenIcon,
  podcast: MicrophoneIcon,
  album: MusicalNoteIcon,
  custom: SparklesIcon,
};

/**
 * Poster Grid theme - visual grid of movie posters with hover details
 */
export default function ListThemePosterGrid({
  list,
  accentColor = "#3B82F6",
}) {
  console.log(`${LOG_PREFIX} Rendering grid: ${list?.title}`);

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
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: accentColor }}
        >
          {list.title}
        </h1>
        {list.description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {list.description}
          </p>
        )}
        {list.year && (
          <span
            className="inline-block mt-3 px-4 py-1.5 rounded-full text-white font-medium"
            style={{ backgroundColor: accentColor }}
          >
            {list.year}
          </span>
        )}
      </div>

      {/* Poster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {list.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="group relative aspect-2/3 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
          >
            {/* Poster */}
            {getImageUrl(item, "large") ? (
              <Image
                src={getImageUrl(item, "large")}
                alt={item.title || item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                {(() => {
                  const FallbackIcon = CATEGORY_ICONS[item.category || list.category] || FilmIcon;
                  return <FallbackIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />;
                })()}
              </div>
            )}

            {/* Rank Badge */}
            <div
              className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              {item.rank || index + 1}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <h3 className="font-semibold text-white text-sm line-clamp-2">
                {item.title || item.name}
              </h3>
              <p className="text-gray-300 text-xs mt-1">
                {getYear(item)}
              </p>
              {item.userRating && (
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < item.userRating ? "text-yellow-400" : "text-gray-500"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
              {item.comment && (
                <p className="text-gray-300 text-xs mt-2 line-clamp-2 italic">
                  "{item.comment}"
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
