"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TrophyIcon, StarIcon } from "@heroicons/react/24/solid";

const LOG_PREFIX = "[ListThemePodium]";

/**
 * Podium theme - Olympic-style podium with 1st, 2nd, 3rd
 */
export default function ListThemePodium({
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

  const getImageUrl = (item) => {
    if (item.poster_path) return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    if (item.image) return item.image;
    return null;
  };

  // Split items
  const first = list.items[0];
  const second = list.items[1];
  const third = list.items[2];
  const others = list.items.slice(3);

  const medalColors = {
    1: "#FFD700", // Gold
    2: "#C0C0C0", // Silver
    3: "#CD7F32", // Bronze
  };

  const PodiumItem = ({ item, place, height }) => {
    if (!item) return <div className={`flex-1 ${height}`} />;

    const imageUrl = getImageUrl(item);
    const medalColor = medalColors[place];

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: place === 1 ? 0 : place * 0.15 }}
        className="flex-1 flex flex-col items-center"
      >
        {/* Poster */}
        <div
          className="relative rounded-lg overflow-hidden shadow-xl mb-3"
          style={{
            width: place === 1 ? '120px' : '100px',
            height: place === 1 ? '180px' : '150px',
          }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title || item.name}
              fill
              sizes={place === 1 ? "120px" : "100px"}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 text-xs">No Poster</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-bold text-center text-gray-900 dark:text-white mb-1 line-clamp-2 ${
          place === 1 ? 'text-base' : 'text-sm'
        }`}>
          {item.title || item.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {getYear(item)}
        </p>

        {/* Rating stars */}
        {item.userRating && (
          <div className="flex gap-0.5 mb-2">
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

        {/* Podium block */}
        <div
          className={`w-full ${height} rounded-t-lg flex items-start justify-center pt-3 relative`}
          style={{ backgroundColor: medalColor }}
        >
          <span className="text-2xl font-black text-white drop-shadow-lg">
            {place === 1 ? "1st" : place === 2 ? "2nd" : "3rd"}
          </span>
          {place === 1 && (
            <TrophyIcon className="absolute -top-6 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-400 drop-shadow-lg" />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {list.title}
        </h1>
        {list.description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {list.description}
          </p>
        )}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 mb-12 px-4">
        {/* 2nd Place (left) */}
        <PodiumItem item={second} place={2} height="h-24" />

        {/* 1st Place (center, tallest) */}
        <PodiumItem item={first} place={1} height="h-32" />

        {/* 3rd Place (right) */}
        <PodiumItem item={third} place={3} height="h-16" />
      </div>

      {/* Others */}
      {others.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-center mb-4 text-gray-600 dark:text-gray-400">
            Also Ranked
          </h3>

          <div className="space-y-2">
            {others.map((item, index) => {
              const imageUrl = getImageUrl(item);
              const rank = index + 4;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  {/* Rank */}
                  <span className="w-8 text-center font-bold text-slate-400 dark:text-slate-500">
                    {rank}
                  </span>

                  {/* Poster */}
                  <div className="w-10 h-14 relative rounded overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={item.title || item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {item.title || item.name}
                    </p>
                    <p className="text-xs text-slate-500">{getYear(item)}</p>
                  </div>

                  {/* Rating */}
                  {item.userRating && (
                    <div className="flex gap-0.5">
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
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comment for 1st place */}
      {first?.comment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <blockquote
            className="text-lg italic text-gray-700 dark:text-gray-300 border-l-4 pl-4 max-w-xl mx-auto text-left"
            style={{ borderColor: accentColor }}
          >
            "{first.comment}"
          </blockquote>
          <p className="text-sm text-gray-500 mt-2">
            — on {first.title || first.name}
          </p>
        </motion.div>
      )}
    </div>
  );
}
