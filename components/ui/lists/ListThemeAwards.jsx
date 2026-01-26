"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TrophyIcon, StarIcon, FilmIcon, TvIcon, BookOpenIcon, MicrophoneIcon, MusicalNoteIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { getImageUrl } from "./themeUtils";

const LOG_PREFIX = "[ListThemeAwards]";

const CATEGORY_ICONS = {
  movie: FilmIcon,
  tv: TvIcon,
  book: BookOpenIcon,
  podcast: MicrophoneIcon,
  album: MusicalNoteIcon,
  custom: SparklesIcon,
};

/**
 * Awards Show theme - elegant ceremony style with winner highlights
 */
export default function ListThemeAwards({
  list,
  accentColor = "#D4AF37", // Gold by default
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

  // Split items into winner and nominees
  const winner = list.items[0];
  const nominees = list.items.slice(1);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-block mb-4"
        >
          <TrophyIcon
            className="h-16 w-16 mx-auto"
            style={{ color: accentColor }}
          />
        </motion.div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          {list.title}
        </h1>
        {list.year && (
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {list.year} Awards
          </p>
        )}
        {list.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto italic">
            {list.description}
          </p>
        )}
      </div>

      {/* Winner */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-center mb-4">
            <span
              className="inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider"
              style={{ backgroundColor: accentColor, color: "#000" }}
            >
              Winner
            </span>
          </div>

          <div
            className="relative p-8 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
              border: `3px solid ${accentColor}`,
            }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
              <TrophyIcon className="w-full h-full" style={{ color: accentColor }} />
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 rotate-12">
              <StarIcon className="w-full h-full" style={{ color: accentColor }} />
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* Large Poster */}
              <div className="shrink-0 w-40 h-60 relative rounded-xl overflow-hidden shadow-2xl ring-4 ring-yellow-400/50">
                {getImageUrl(winner, "large") ? (
                  <Image
                    src={getImageUrl(winner, "large")}
                    alt={winner.title || winner.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    {(() => {
                      const FallbackIcon = CATEGORY_ICONS[winner.category || list.category] || FilmIcon;
                      return <FallbackIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />;
                    })()}
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {winner.title || winner.name}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {getYear(winner)}
                </p>

                {winner.userRating && (
                  <div className="flex items-center justify-center sm:justify-start gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-6 w-6 ${
                          i < winner.userRating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {winner.comment && (
                  <blockquote
                    className="text-lg italic text-gray-700 dark:text-gray-300 border-l-4 pl-4"
                    style={{ borderColor: accentColor }}
                  >
                    "{winner.comment}"
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Nominees */}
      {nominees.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-center mb-6 text-gray-700 dark:text-gray-300">
            Also Nominated
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nominees.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Poster */}
                <div className="relative aspect-2/3">
                  {getImageUrl(item, "medium") ? (
                    <Image
                      src={getImageUrl(item, "medium")}
                      alt={item.title || item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      {(() => {
                        const FallbackIcon = CATEGORY_ICONS[item.category || list.category] || FilmIcon;
                        return <FallbackIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />;
                      })()}
                    </div>
                  )}

                  {/* Rank Badge */}
                  <div
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-lg"
                    style={{ backgroundColor: "#71717a" }}
                  >
                    #{item.rank || index + 2}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                    {item.title || item.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getYear(item)}
                  </p>
                  {item.userRating && (
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-3 w-3 ${
                            i < item.userRating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
