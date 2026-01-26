"use client";

// components/layout/hero/TrendingGrid.jsx
// Peaceful animated trending grid - slow, smooth transitions

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/solid";

const CATEGORY_CONFIG = {
  movie: {
    icon: FilmIcon,
    gradient: "from-amber-600 to-orange-700",
    label: "Movie",
    color: "text-amber-500",
  },
  tv: {
    icon: TvIcon,
    gradient: "from-blue-600 to-indigo-700",
    label: "TV",
    color: "text-blue-500",
  },
  book: {
    icon: BookOpenIcon,
    gradient: "from-emerald-600 to-teal-700",
    label: "Book",
    color: "text-emerald-500",
  },
  podcast: {
    icon: MicrophoneIcon,
    gradient: "from-purple-600 to-violet-700",
    label: "Podcast",
    color: "text-purple-500",
  },
};

function getItemImageUrl(item) {
  if (item.poster_path) {
    return `https://image.tmdb.org/t/p/w300${item.poster_path}`;
  }
  if (item.image) {
    return item.image;
  }
  return null;
}

function getItemName(item) {
  return item.name || item.title || "Unknown";
}

function getItemLink(item, category) {
  if (category === "movie") return `/movies/${item.externalId || item.id}`;
  if (category === "tv") return `/tv/${item.externalId || item.id}`;
  return `/create?category=${category}`;
}

function TrendingCard({ item, isSwapping }) {
  const imageUrl = getItemImageUrl(item);
  const itemName = getItemName(item);
  const config = CATEGORY_CONFIG[item._category];
  const IconComponent = config?.icon || FilmIcon;

  return (
    <Link
      href={getItemLink(item, item._category)}
      className="group flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-300 h-full"
    >
      {/* Poster/Image with gentle fade */}
      <motion.div
        animate={{ opacity: isSwapping ? 0 : 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 shadow-sm group-hover:shadow-md transition-shadow duration-500"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={itemName}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${config?.gradient || "from-slate-600 to-slate-700"}`}
          >
            <IconComponent className="w-8 h-8 text-white/70" />
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.span
        animate={{ opacity: isSwapping ? 0 : 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white text-center line-clamp-2 leading-tight"
      >
        {itemName}
      </motion.span>

      {/* Category badge */}
      <span
        className={`text-[10px] mt-1 ${config?.color || "text-slate-500"} font-medium`}
      >
        {config?.label || "Media"}
      </span>
    </Link>
  );
}

export default function TrendingGrid({ items }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  const [displayedItems, setDisplayedItems] = useState(items.slice(0, 8));
  const [swappingIndex, setSwappingIndex] = useState(-1);
  const [allItems] = useState(items);

  // Gentle rotation - one item at a time, slowly
  useEffect(() => {
    if (allItems.length <= 8 || !isInView) return;

    const interval = setInterval(() => {
      // Pick next slot to replace (cycles through)
      const slotToReplace = Math.floor(Math.random() * 8);

      // Start fade out
      setSwappingIndex(slotToReplace);

      // After fade out, swap the item
      setTimeout(() => {
        setDisplayedItems((current) => {
          const currentIds = new Set(current.map((i) => i.id));
          const availableItems = allItems.filter((i) => !currentIds.has(i.id));

          if (availableItems.length === 0) return current;

          const newItem =
            availableItems[Math.floor(Math.random() * availableItems.length)];

          const newDisplayed = [...current];
          newDisplayed[slotToReplace] = newItem;
          return newDisplayed;
        });

        // Start fade in
        setTimeout(() => {
          setSwappingIndex(-1);
        }, 100);
      }, 1500); // Match fade out duration
    }, 8000); // Swap every 8 seconds

    return () => clearInterval(interval);
  }, [allItems, isInView]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="grid grid-cols-4 sm:grid-cols-8 gap-px bg-slate-300 dark:bg-slate-600 border border-slate-300 dark:border-slate-600"
    >
      {displayedItems.map((item, index) => (
        <TrendingCard
          key={`slot-${index}`}
          item={item}
          isSwapping={swappingIndex === index}
        />
      ))}
    </motion.div>
  );
}
