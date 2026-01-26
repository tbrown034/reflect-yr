// components/layout/hero/scrollingMedia/ScrollingCategory.jsx
// Unified scrolling row component for any category

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/solid";
import { discover, CATEGORIES } from "@/library/api/providers";

/**
 * Get the icon component for a category
 */
function getCategoryIcon(category) {
  const icons = {
    movie: FilmIcon,
    tv: TvIcon,
    book: BookOpenIcon,
    podcast: MicrophoneIcon,
    album: MusicalNoteIcon,
  };
  return icons[category] || FilmIcon;
}

/**
 * Get the gradient colors for a category's placeholder
 */
function getCategoryGradient(category) {
  const gradients = {
    movie: "from-amber-600 to-orange-700",
    tv: "from-blue-600 to-indigo-700",
    book: "from-emerald-600 to-teal-700",
    podcast: "from-purple-600 to-violet-700",
    album: "from-pink-500 to-rose-600",
  };
  return gradients[category] || "from-slate-600 to-slate-700";
}

/**
 * Get the appropriate image URL for an item based on its category
 */
function getItemImageUrl(item) {
  // TMDB items (movie, tv)
  if (item.poster_path) {
    return `https://image.tmdb.org/t/p/w300${item.poster_path}`;
  }
  // Provider items that normalize to 'image' field
  if (item.image) {
    return item.image;
  }
  return null;
}

/**
 * Get the link URL for an item
 */
function getItemLink(item, category) {
  // For TMDB items, use the direct ID
  if (category === "movie") {
    return `/movies/${item.externalId || item.id}`;
  }
  if (category === "tv") {
    return `/tv/${item.externalId || item.id}`;
  }
  // For other categories, we could add detail pages later
  // For now, link to the create page with category
  return `/create?category=${category}`;
}

/**
 * Get display name for the item
 */
function getItemName(item) {
  return item.name || item.title || "Unknown";
}

export default async function ScrollingCategory({
  category = "movie",
  year,
  limit = 15,
  direction = "left", // "left" or "right"
  showYear = true,
}) {
  const categoryConfig = CATEGORIES[category];
  if (!categoryConfig) {
    console.error(`[ScrollingCategory] Unknown category: ${category}`);
    return null;
  }

  let items = [];

  try {
    items = await discover(category, {
      year: categoryConfig.hasYear ? year : undefined,
      limit,
    });
  } catch (error) {
    console.error(`[ScrollingCategory] Error fetching ${category}:`, error);
  }

  // Get the "View All" link based on category
  const getViewAllLink = () => {
    switch (category) {
      case "movie":
        return `/movies${year ? `?year=${year}` : ""}`;
      case "tv":
        return `/tv${year ? `?year=${year}` : ""}`;
      default:
        return `/create?category=${category}`;
    }
  };

  if (items.length === 0) {
    return (
      <div className="w-full px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Popular {categoryConfig.name}
            {showYear && categoryConfig.hasYear && year && (
              <span className="text-yellow-500 dark:text-yellow-400">
                ({year})
              </span>
            )}
          </h2>
          <Link
            href={getViewAllLink()}
            className="text-sm font-medium text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            View All
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
          <p className="text-slate-600 dark:text-slate-400">
            No {categoryConfig.name.toLowerCase()} available
            {categoryConfig.hasYear && year && ` for ${year}`}
          </p>
        </div>
      </div>
    );
  }

  // Double items for continuous scrolling effect
  const doubledItems = [...items, ...items];
  const animationClass =
    direction === "right" ? "animate-scrollRight" : "animate-scrollLeft";

  return (
    <div className="w-full px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Popular {categoryConfig.name}
          {showYear && categoryConfig.hasYear && year && (
            <span className="text-yellow-500 dark:text-yellow-400">({year})</span>
          )}
        </h2>
        <Link
          href={getViewAllLink()}
          className="text-sm font-medium text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          View All
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Container with overflow hidden */}
      <div className="relative overflow-hidden rounded-xl group">
        {/* Inner content that scrolls - pauses on hover */}
        <div
          className={`flex ${animationClass} gap-4 w-max py-4 group-hover:pause transition-all duration-300`}
        >
          {doubledItems.map((item, index) => {
            const imageUrl = getItemImageUrl(item);
            const itemName = getItemName(item);

            return (
              <Link
                key={`${item.id}-${index}`}
                href={getItemLink(item, category)}
                className="shrink-0 w-28 sm:w-36 transition-transform hover:scale-105 cursor-pointer"
              >
                <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden shadow-md bg-slate-200 dark:bg-slate-700">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`Poster of ${itemName}`}
                      fill
                      sizes="(max-width: 640px) 112px, 144px"
                      className="object-cover"
                    />
                  ) : (
                    (() => {
                      const IconComponent = getCategoryIcon(category);
                      const gradient = getCategoryGradient(category);
                      return (
                        <div
                          className={`w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br ${gradient}`}
                        >
                          <IconComponent className="w-8 h-8 text-white/70 mb-2" />
                          <span className="text-xs text-center text-white font-medium line-clamp-3 leading-tight">
                            {itemName}
                          </span>
                        </div>
                      );
                    })()
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
