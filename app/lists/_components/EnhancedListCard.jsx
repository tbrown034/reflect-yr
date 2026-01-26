"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
  SparklesIcon,
  StarIcon,
  FireIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { LIST_THEMES } from "@/library/contexts/ListContext";
import { calculateSingleListStats, formatListDate } from "@/library/utils/listUtils";
import ListCardActions from "./ListCardActions";

const categoryIcons = {
  movie: FilmIcon,
  tv: TvIcon,
  book: BookOpenIcon,
  podcast: MicrophoneIcon,
};

const categoryColors = {
  movie: "border-blue-500",
  tv: "border-purple-500",
  book: "border-green-500",
  podcast: "border-orange-500",
};

const themeBadgeIcons = {
  classic: "1.",
  "poster-grid": "grid",
  "family-feud": "?",
  awards: "award",
  minimalist: "—",
};

/**
 * EnhancedListCard - Rich card showing multiple posters, theme badge, stats, and quick actions
 */
export default function EnhancedListCard({
  list,
  onDelete,
  onShare,
  onPreview,
  isRecommendation = false,
}) {
  const [showActions, setShowActions] = useState(false);

  const type = list.type || "movie";
  const urlType = type === "movie" ? "movies" : type === "tv" ? "tv" : type;
  const itemCount = list.items?.length || 0;

  // Get path based on list type
  const path = isRecommendation
    ? `/lists/${urlType}/saved-recommendations/${list.id}`
    : `/lists/${urlType}/publish/${list.id}`;

  // Calculate stats
  const stats = calculateSingleListStats(list);

  // Get first 4 items for poster display
  const displayItems = list.items?.slice(0, 4) || [];

  // Get category icon and color
  const CategoryIcon = isRecommendation
    ? SparklesIcon
    : categoryIcons[type] || FilmIcon;
  const borderColor = isRecommendation
    ? "border-purple-500"
    : categoryColors[type] || "border-blue-500";

  // Get theme info
  const theme = LIST_THEMES[list.theme] || LIST_THEMES.classic;

  // Get poster URL for an item
  const getPosterUrl = (item) => {
    if (item.image) return item.image;
    if (item.poster_path) return `https://image.tmdb.org/t/p/w200${item.poster_path}`;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 sm:hover:-translate-y-1 border-l-4 ${borderColor}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Link href={path} className="block">
        <div className="p-3 sm:p-4">
          {/* Top row: Posters + Actions */}
          <div className="flex items-start justify-between mb-3">
            {/* Multi-poster display */}
            <div className="flex items-center">
              {displayItems.length > 0 ? (
                <div className="flex items-center">
                  {displayItems.map((item, index) => {
                    const posterUrl = getPosterUrl(item);
                    return (
                      <div
                        key={item.id || index}
                        className={`relative w-10 h-14 sm:w-12 sm:h-16 rounded-md overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm ${
                          index > 0 ? "-ml-3 sm:-ml-4" : ""
                        }`}
                        style={{ zIndex: 4 - index }}
                      >
                        {posterUrl ? (
                          <Image
                            src={posterUrl}
                            alt={item.name || item.title || ""}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <CategoryIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {itemCount > 4 && (
                    <div className="w-10 h-14 sm:w-12 sm:h-16 -ml-3 sm:-ml-4 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                      +{itemCount - 4}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-12 h-16 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <CategoryIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Actions menu */}
            <div className="shrink-0" onClick={(e) => e.preventDefault()}>
              <ListCardActions
                list={list}
                onDelete={onDelete}
                onShare={onShare}
                onPreview={onPreview}
                visible={showActions}
              />
            </div>
          </div>

          {/* Middle row: Theme badge + visibility */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              style={{
                borderColor: list.accentColor || "#3B82F6",
                borderWidth: "1px",
              }}
            >
              <span>{themeBadgeIcons[list.theme] || "1."}</span>
              <span>{theme.name}</span>
            </span>

            {list.isPublic !== false ? (
              <GlobeAltIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" title="Public" />
            ) : (
              <LockClosedIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" title="Private" />
            )}

            {isRecommendation && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                <SparklesIcon className="h-3 w-3" />
                AI
              </span>
            )}
          </div>

          {/* Title */}
          <div className="flex items-center gap-1.5 mb-1">
            <CategoryIcon
              className={`shrink-0 h-4 w-4 sm:h-5 sm:w-5 ${
                isRecommendation
                  ? "text-purple-500"
                  : type === "movie"
                  ? "text-blue-500"
                  : type === "tv"
                  ? "text-purple-500"
                  : type === "book"
                  ? "text-green-500"
                  : "text-orange-500"
              }`}
            />
            <h2 className="text-sm sm:text-base md:text-lg font-semibold truncate text-gray-900 dark:text-white">
              {list.title}
            </h2>
          </div>

          {/* Subtitle: count + date */}
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
            {itemCount} {itemCount === 1 ? "item" : "items"} · {formatListDate(list.publishedAt || list.savedAt)}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-2 sm:gap-3">
            {stats.avgRating && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                {stats.avgRating}
              </span>
            )}

            {stats.hotTakesCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-orange-600 dark:text-orange-400">
                <FireIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                {stats.hotTakesCount} hot {stats.hotTakesCount === 1 ? "take" : "takes"}
              </span>
            )}

            {/* Accent color swatch */}
            <div
              className="ml-auto w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: list.accentColor || "#3B82F6" }}
              title={`Accent: ${list.accentColor}`}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
