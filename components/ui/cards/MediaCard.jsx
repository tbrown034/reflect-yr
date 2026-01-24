"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, FireIcon } from "@heroicons/react/24/solid";
import {
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import AddToListButton from "@/components/ui/buttons/actions/AddToListButton";
import { use } from "react";
import { ListContext } from "@/library/contexts/ListContext";
import { motion } from "framer-motion";

// Category-specific configurations
const CATEGORY_CONFIG = {
  movie: {
    icon: FilmIcon,
    gradient: "from-blue-500 via-blue-600 to-purple-600",
    placeholder: "/placeholder-movie.jpg",
    detailPath: (id) => `/movies/${id}`,
    getTitle: (item) => item.title || item.name,
    getYear: (item) =>
      item.release_date
        ? new Date(item.release_date).getFullYear()
        : item.year || null,
    getRating: (item) => item.vote_average,
    getImage: (item) =>
      item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : item.image,
  },
  tv: {
    icon: TvIcon,
    gradient: "from-purple-500 via-purple-600 to-blue-600",
    placeholder: "/placeholder-tv.jpg",
    detailPath: (id) => `/tv/${id}`,
    getTitle: (item) => item.name || item.title,
    getYear: (item) =>
      item.first_air_date
        ? new Date(item.first_air_date).getFullYear()
        : item.year || null,
    getRating: (item) => item.vote_average,
    getImage: (item) =>
      item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : item.image,
  },
  book: {
    icon: BookOpenIcon,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    placeholder: null,
    detailPath: (id) => `/create?category=book`,
    getTitle: (item) => item.name || item.title,
    getYear: (item) => item.year || item.first_publish_year,
    getRating: (item) => null,
    getImage: (item) => item.image,
  },
  anime: {
    icon: SparklesIcon,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    placeholder: null,
    detailPath: (id) => `/create?category=anime`,
    getTitle: (item) => item.name || item.title,
    getYear: (item) => item.year,
    getRating: (item) => item.metadata?.score,
    getImage: (item) => item.image,
  },
  podcast: {
    icon: MicrophoneIcon,
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    placeholder: null,
    detailPath: (id) => `/create?category=podcast`,
    getTitle: (item) => item.name || item.collectionName,
    getYear: (item) => item.year,
    getRating: (item) => null,
    getImage: (item) => item.image || item.artworkUrl600,
  },
};

// Calculate if this is a "Hot Take" (user opinion differs significantly from consensus)
function isHotTake(userRating, consensusRating) {
  if (!userRating || !consensusRating) return false;
  // Convert user 1-5 star rating to 1-10 scale
  const userScaled = userRating * 2;
  const diff = Math.abs(userScaled - consensusRating);
  return diff >= 3; // 3+ point difference = hot take
}

export default function MediaCard({
  item,
  category = "movie",
  userRating = null,
  showHotTake = true,
  index = 0,
}) {
  const [imageError, setImageError] = useState(false);
  const { isInList } = use(ListContext);

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.movie;
  const CategoryIcon = config.icon;

  const title = config.getTitle(item);
  const year = config.getYear(item);
  const rating = config.getRating(item);
  const imageUrl = config.getImage(item);
  const itemId = item.id || item.externalId;

  const hotTake = showHotTake && isHotTake(userRating, rating);

  return (
    <motion.li
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={config.detailPath(itemId)} className="block h-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col relative group">
          <div className="relative aspect-2/3 w-full overflow-hidden">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={`${title} poster`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${config.gradient} text-white/80`}
              >
                <CategoryIcon className="h-12 w-12 mb-2" />
                <span className="text-xs text-center px-2 line-clamp-2">
                  {title}
                </span>
              </div>
            )}

            {/* Rating badge */}
            {rating && (
              <div className="absolute top-3 left-3 flex items-center bg-black/80 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1.5" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}

            {/* Hot Take badge */}
            {hotTake && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 left-3 mt-10 flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md"
              >
                <FireIcon className="h-3 w-3 mr-1" />
                <span>Hot Take</span>
              </motion.div>
            )}

            {/* Add to list button */}
            <div className="absolute top-3 right-3 z-10">
              <AddToListButton itemType={category} item={item} />
            </div>
          </div>

          {/* Gradient accent bar */}
          <div
            className={`h-1.5 w-full bg-gradient-to-r ${config.gradient}`}
          ></div>

          {/* Content */}
          <div className="p-5 grow flex flex-col bg-white dark:bg-gray-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-1">
              {title}
            </h3>
            {year && (
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {year}
              </p>
            )}
            {item.overview && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 grow">
                {item.overview}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
