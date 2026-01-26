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
} from "@heroicons/react/24/solid";
import { formatListDate } from "@/library/utils/listUtils";
import ListCardActions from "./ListCardActions";

const categoryIcons = {
  movie: FilmIcon,
  tv: TvIcon,
  book: BookOpenIcon,
  podcast: MicrophoneIcon,
};

// Map internal category types to URL-friendly plural forms
const CATEGORY_TO_URL = {
  movie: "movies",
  tv: "tv",
  book: "books",
  podcast: "podcasts",
  album: "albums",
  custom: "custom",
};

/**
 * EnhancedListCard - Clean card with stacked posters
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
  const urlType = CATEGORY_TO_URL[type] || type;
  const itemCount = list.items?.length || 0;

  const path = isRecommendation
    ? `/lists/${urlType}/saved-recommendations/${list.id}`
    : `/lists/${urlType}/publish/${list.id}`;

  const displayItems = list.items?.slice(0, 4) || [];
  const CategoryIcon = isRecommendation
    ? SparklesIcon
    : categoryIcons[type] || FilmIcon;

  const getPosterUrl = (item) => {
    if (item.image) return item.image;
    if (item.poster_path) return `https://image.tmdb.org/t/p/w200${item.poster_path}`;
    return null;
  };

  // Calculate average rating if items have ratings
  const avgRating = list.items?.length > 0
    ? list.items.filter(i => i.userRating).reduce((sum, i) => sum + i.userRating, 0) /
      list.items.filter(i => i.userRating).length
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Link href={path} className="block p-4">
        {/* Stacked posters + title row */}
        <div className="flex items-start gap-4">
          {/* Stacked posters */}
          <div className="flex items-center shrink-0">
            {displayItems.length > 0 ? (
              <>
                {displayItems.map((item, index) => {
                  const posterUrl = getPosterUrl(item);
                  return (
                    <div
                      key={item.id || index}
                      className={`relative w-11 h-16 rounded overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm ${
                        index > 0 ? "-ml-4" : ""
                      }`}
                      style={{ zIndex: 4 - index }}
                    >
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <CategoryIcon className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
                {itemCount > 4 && (
                  <div className="w-11 h-16 -ml-4 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-500 border-2 border-white dark:border-slate-800">
                    +{itemCount - 4}
                  </div>
                )}
              </>
            ) : (
              <div className="w-11 h-16 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <CategoryIcon className="h-5 w-5 text-slate-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-900 dark:text-white truncate">
              {list.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {itemCount} {itemCount === 1 ? "item" : "items"}
              {list.year && ` · ${list.year}`}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
              {avgRating > 0 && (
                <span className="flex items-center gap-1">
                  <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                  {avgRating.toFixed(1)}
                </span>
              )}
              {isRecommendation && (
                <span className="flex items-center gap-1">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  AI
                </span>
              )}
              <span>{formatListDate(list.publishedAt || list.savedAt)}</span>
            </div>
          </div>

          {/* Actions */}
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
      </Link>
    </motion.div>
  );
}
