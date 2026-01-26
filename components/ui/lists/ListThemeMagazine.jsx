"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import {
  getYear,
  getTitle,
  getImageUrl,
  hasImage,
  fadeInUp,
  staggerContainerSlow,
  truncateText,
  getContrastColor,
} from "./themeUtils";

const LOG_PREFIX = "[ListThemeMagazine]";

/**
 * Magazine theme - editorial/magazine ranking layout
 * Inspired by Rolling Stone year-end issues and magazine "Best Of" spreads
 *
 * Typography hierarchy:
 * - Level 1: Large display headline for #1 item
 * - Level 2: Medium section headers for #2-3 (runners-up)
 * - Level 3: Body text for remaining items (#4+)
 */
export default function ListThemeMagazine({
  list,
  accentColor = "#DC2626", // Magazine red by default
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  console.log(
    `${LOG_PREFIX} Rendering list: ${list?.title} with ${list?.items?.length} items`
  );

  if (!list || !list.items) {
    return <div className="text-gray-500 font-serif">No list data</div>;
  }

  // Split items into tiers
  const heroItem = list.items[0];
  const runnersUp = list.items.slice(1, 3);
  const remaining = list.items.slice(3);

  const renderStars = (rating, itemId) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = rating && i <= rating;
      stars.push(
        <button
          key={i}
          onClick={() => isEditable && onUpdateRating?.(itemId, i)}
          disabled={!isEditable}
          className={`${isEditable ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          {isFilled ? (
            <StarIcon className="h-4 w-4 text-yellow-500" />
          ) : (
            <StarOutline className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <article className="max-w-5xl mx-auto font-serif">
      {/* Masthead / Header */}
      <header className="text-center mb-12 pb-8 border-b-4 border-double border-gray-900 dark:border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {list.year && (
            <p
              className="text-sm uppercase tracking-[0.3em] mb-4"
              style={{ color: accentColor }}
            >
              The Definitive Rankings of {list.year}
            </p>
          )}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            {list.title}
          </h1>
          {list.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 italic max-w-2xl mx-auto leading-relaxed">
              {list.description}
            </p>
          )}
        </motion.div>
      </header>

      {/* Level 1: Hero / #1 Item - Large Feature */}
      {heroItem && (
        <motion.section
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="relative">
            {/* Large rank number as background */}
            <div
              className="absolute -top-8 -left-4 text-[12rem] md:text-[16rem] font-bold leading-none opacity-10 select-none pointer-events-none"
              style={{ color: accentColor }}
            >
              1
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Hero Image */}
              <div className="relative aspect-[2/3] lg:aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
                {hasImage(heroItem) ? (
                  <Image
                    src={getImageUrl(heroItem, "xlarge")}
                    alt={getTitle(heroItem)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-lg">
                      No Image
                    </span>
                  </div>
                )}
              </div>

              {/* Hero Content */}
              <div className="relative z-10">
                <span
                  className="inline-block px-3 py-1 text-xs uppercase tracking-wider font-sans font-bold mb-4 rounded"
                  style={{
                    backgroundColor: accentColor,
                    color: getContrastColor(accentColor),
                  }}
                >
                  Number One
                </span>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {getTitle(heroItem)}
                </h2>

                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                  {getYear(heroItem)}
                  {heroItem.vote_average && (
                    <span className="ml-4 font-sans text-sm">
                      TMDB: {heroItem.vote_average.toFixed(1)}
                    </span>
                  )}
                </p>

                {/* User Rating */}
                {(heroItem.userRating || isEditable) && (
                  <div className="flex items-center gap-1 mb-6">
                    {renderStars(heroItem.userRating, heroItem.id)}
                  </div>
                )}

                {/* Pull Quote from Comment */}
                {heroItem.comment ? (
                  <blockquote className="relative pl-8 pr-4 py-4">
                    {/* Large quotation mark */}
                    <span
                      className="absolute top-0 left-0 text-6xl leading-none font-serif opacity-30"
                      style={{ color: accentColor }}
                    >
                      "
                    </span>
                    {isEditable ? (
                      <textarea
                        value={heroItem.comment}
                        onChange={(e) =>
                          onUpdateComment?.(heroItem.id, e.target.value)
                        }
                        placeholder="Write your featured review..."
                        className="w-full text-2xl italic text-gray-700 dark:text-gray-300 leading-relaxed bg-transparent border-none resize-none focus:ring-0 focus:outline-none"
                        rows={4}
                      />
                    ) : (
                      <p className="text-2xl italic text-gray-700 dark:text-gray-300 leading-relaxed">
                        {heroItem.comment}
                      </p>
                    )}
                    <span
                      className="absolute bottom-0 right-0 text-6xl leading-none font-serif opacity-30 rotate-180"
                      style={{ color: accentColor }}
                    >
                      "
                    </span>
                  </blockquote>
                ) : isEditable ? (
                  <textarea
                    value=""
                    onChange={(e) =>
                      onUpdateComment?.(heroItem.id, e.target.value)
                    }
                    placeholder="Write your featured review..."
                    className="w-full p-4 text-lg italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 resize-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Elegant Divider */}
      <div className="flex items-center gap-4 my-12">
        <div
          className="grow h-px"
          style={{ backgroundColor: accentColor, opacity: 0.3 }}
        />
        <span
          className="text-sm uppercase tracking-[0.2em] font-sans"
          style={{ color: accentColor }}
        >
          The Runners-Up
        </span>
        <div
          className="grow h-px"
          style={{ backgroundColor: accentColor, opacity: 0.3 }}
        />
      </div>

      {/* Level 2: Runners-Up (#2-3) - Medium Feature */}
      {runnersUp.length > 0 && (
        <motion.section
          className="mb-16"
          variants={staggerContainerSlow}
          initial="initial"
          animate="animate"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {runnersUp.map((item, index) => (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                className="group relative"
              >
                {/* Rank number */}
                <div
                  className="absolute -top-6 -left-2 text-8xl font-bold leading-none opacity-10 select-none pointer-events-none"
                  style={{ color: accentColor }}
                >
                  {item.rank || index + 2}
                </div>

                <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {hasImage(item) ? (
                      <Image
                        src={getImageUrl(item, "large")}
                        alt={getTitle(item)}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500">
                          No Image
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {getTitle(item)}
                      </h3>
                      <p className="text-sm text-gray-300">{getYear(item)}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-0.5">
                        {renderStars(item.userRating, item.id)}
                      </div>
                      {item.vote_average && (
                        <span className="text-xs text-gray-500 font-sans ml-2">
                          TMDB: {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Comment / Pull Quote */}
                    {item.comment ? (
                      <div className="relative">
                        <span
                          className="absolute -top-2 -left-2 text-3xl leading-none opacity-20"
                          style={{ color: accentColor }}
                        >
                          "
                        </span>
                        {isEditable ? (
                          <textarea
                            value={item.comment}
                            onChange={(e) =>
                              onUpdateComment?.(item.id, e.target.value)
                            }
                            className="w-full pl-4 text-base italic text-gray-600 dark:text-gray-400 leading-relaxed bg-transparent border-none resize-none focus:ring-0 focus:outline-none"
                            rows={3}
                          />
                        ) : (
                          <p className="pl-4 text-base italic text-gray-600 dark:text-gray-400 leading-relaxed">
                            {truncateText(item.comment, 200)}
                          </p>
                        )}
                      </div>
                    ) : isEditable ? (
                      <textarea
                        value=""
                        onChange={(e) =>
                          onUpdateComment?.(item.id, e.target.value)
                        }
                        placeholder="Add your thoughts..."
                        className="w-full p-2 text-sm italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 resize-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Level 3: Remaining Items (#4+) - Body Text Layout */}
      {remaining.length > 0 && (
        <>
          {/* Elegant Divider */}
          <div className="flex items-center gap-4 my-12">
            <div
              className="grow h-px"
              style={{ backgroundColor: accentColor, opacity: 0.3 }}
            />
            <span
              className="text-sm uppercase tracking-[0.2em] font-sans"
              style={{ color: accentColor }}
            >
              The Rest of the Best
            </span>
            <div
              className="grow h-px"
              style={{ backgroundColor: accentColor, opacity: 0.3 }}
            />
          </div>

          <motion.section
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainerSlow}
            initial="initial"
            animate="animate"
          >
            {remaining.map((item, index) => (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
              >
                {/* Compact Image */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  {hasImage(item) ? (
                    <Image
                      src={getImageUrl(item, "medium")}
                      alt={getTitle(item)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500 text-sm">
                        No Image
                      </span>
                    </div>
                  )}
                  {/* Rank Badge */}
                  <div
                    className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg font-sans"
                    style={{
                      backgroundColor: accentColor,
                      color: getContrastColor(accentColor),
                    }}
                  >
                    {item.rank || index + 4}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {getTitle(item)}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {getYear(item)}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {renderStars(item.userRating, item.id)}
                  </div>

                  {/* Comment (truncated) */}
                  {item.comment ? (
                    isEditable ? (
                      <textarea
                        value={item.comment}
                        onChange={(e) =>
                          onUpdateComment?.(item.id, e.target.value)
                        }
                        className="w-full p-2 text-sm italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded resize-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm italic text-gray-600 dark:text-gray-400 line-clamp-3">
                        "{truncateText(item.comment, 120)}"
                      </p>
                    )
                  ) : isEditable ? (
                    <textarea
                      value=""
                      onChange={(e) =>
                        onUpdateComment?.(item.id, e.target.value)
                      }
                      placeholder="Add a note..."
                      className="w-full p-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 rounded resize-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  ) : null}
                </div>
              </motion.div>
            ))}
          </motion.section>
        </>
      )}

      {/* Footer / Colophon */}
      <footer className="mt-16 pt-8 border-t-2 border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500 font-sans uppercase tracking-wider">
          Curated with Sortid
        </p>
      </footer>
    </article>
  );
}
