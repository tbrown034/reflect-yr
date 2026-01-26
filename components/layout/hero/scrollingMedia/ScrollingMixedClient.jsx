"use client";

// components/layout/hero/scrollingMedia/ScrollingMixedClient.jsx
// Simple auto-scrolling mixed media row

import Image from "next/image";
import Link from "next/link";
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
  },
  tv: {
    icon: TvIcon,
    gradient: "from-blue-600 to-indigo-700",
    label: "TV",
  },
  book: {
    icon: BookOpenIcon,
    gradient: "from-emerald-600 to-teal-700",
    label: "Book",
  },
  podcast: {
    icon: MicrophoneIcon,
    gradient: "from-purple-600 to-violet-700",
    label: "Podcast",
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
  return `/explore?category=${category}`;
}

export default function ScrollingMixedClient({
  items,
  direction = "left",
  speed = 90 // seconds for full scroll
}) {
  // Double items for continuous loop
  const doubledItems = [...items, ...items];

  const animationName = direction === "right" ? "scrollRight" : "scrollLeft";

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl">
        {/* Subtle edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/80 dark:from-slate-900/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/80 dark:from-slate-900/80 to-transparent z-10 pointer-events-none" />

        <div
          className={`flex gap-6 sm:gap-8 w-max py-4 px-2 animate-${animationName}`}
          style={{ animationDuration: `${speed}s` }}
        >
          {doubledItems.map((item, index) => {
            const imageUrl = getItemImageUrl(item);
            const itemName = getItemName(item);
            const config = CATEGORY_CONFIG[item._category];
            const IconComponent = config?.icon || FilmIcon;

            return (
              <Link
                key={`${item.id}-${index}`}
                href={getItemLink(item, item._category)}
                className="shrink-0 w-28 sm:w-32 transition-transform hover:scale-105"
              >
                <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={itemName}
                        fill
                        sizes="(max-width: 640px) 112px, 128px"
                        className="object-cover"
                      />
                      {/* Category badge */}
                      <div
                        className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-white bg-gradient-to-r ${config?.gradient || "from-slate-600 to-slate-700"} shadow-sm`}
                      >
                        {config?.label || "Media"}
                      </div>
                    </>
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br ${config?.gradient || "from-slate-600 to-slate-700"}`}
                    >
                      <IconComponent className="w-8 h-8 text-white/70 mb-2" />
                      <span className="text-xs text-center text-white font-medium line-clamp-3 leading-tight">
                        {itemName}
                      </span>
                    </div>
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
