"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayIcon, ChevronDownIcon, FilmIcon, TvIcon, BookOpenIcon, MicrophoneIcon, MusicalNoteIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { getImageUrl } from "./themeUtils";

const LOG_PREFIX = "[ListThemeFamilyFeud]";

const CATEGORY_ICONS = {
  movie: FilmIcon,
  tv: TvIcon,
  book: BookOpenIcon,
  podcast: MicrophoneIcon,
  album: MusicalNoteIcon,
  custom: SparklesIcon,
};

/**
 * Family Feud theme - reveal items one by one with game show style
 */
export default function ListThemeFamilyFeud({
  list,
  accentColor = "#3B82F6",
}) {
  const [revealedItems, setRevealedItems] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  console.log(`${LOG_PREFIX} Rendering: ${list?.title}, revealed: ${revealedItems.size}`);

  if (!list || !list.items) {
    return <div className="text-gray-500">No list data</div>;
  }

  const getYear = (item) => {
    if (item.release_date) return item.release_date.split("-")[0];
    if (item.first_air_date) return item.first_air_date.split("-")[0];
    if (item.year) return item.year;
    return null;
  };

  const revealItem = (index) => {
    setRevealedItems((prev) => new Set([...prev, index]));
  };

  const revealAll = () => {
    setShowAll(true);
    setRevealedItems(new Set(list.items.map((_, i) => i)));
  };

  const resetReveals = () => {
    setShowAll(false);
    setRevealedItems(new Set());
  };

  const isRevealed = (index) => showAll || revealedItems.has(index);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-4xl font-bold mb-2 uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          {list.title}
        </h1>
        {list.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {list.description}
          </p>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={revealAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <PlayIcon className="h-5 w-5" />
            Reveal All
          </button>
          <button
            onClick={resetReveals}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div
        className="rounded-2xl p-6 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`,
          border: `4px solid ${accentColor}`,
        }}
      >
        <div className="space-y-3">
          {list.items.map((item, index) => (
            <motion.div
              key={item.id}
              className="relative"
            >
              <AnimatePresence mode="wait">
                {isRevealed(index) ? (
                  <motion.div
                    key="revealed"
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                  >
                    {/* Rank */}
                    <div
                      className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {item.rank || index + 1}
                    </div>

                    {/* Poster */}
                    <div className="shrink-0 w-12 h-16 relative rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {getImageUrl(item, "small") ? (
                        <Image
                          src={getImageUrl(item, "small")}
                          alt={item.title || item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                          {(() => {
                            const FallbackIcon = CATEGORY_ICONS[item.category || list.category] || FilmIcon;
                            return <FallbackIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />;
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="grow">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {item.title || item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getYear(item)}
                      </p>
                    </div>

                    {/* Rating Stars */}
                    {item.userRating && (
                      <div className="shrink-0">
                        <span className="text-yellow-400 text-lg">
                          {"★".repeat(item.userRating)}
                          {"☆".repeat(5 - item.userRating)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    key="hidden"
                    onClick={() => revealItem(index)}
                    initial={{ opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-between p-4 rounded-xl text-white font-bold text-xl transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                        {item.rank || index + 1}
                      </span>
                      <span className="tracking-wider">???</span>
                    </span>
                    <ChevronDownIcon className="h-6 w-6 animate-bounce" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Revealed Count */}
      <div className="text-center mt-6 text-gray-500 dark:text-gray-400">
        {revealedItems.size} / {list.items.length} revealed
      </div>
    </div>
  );
}
