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
} from "./themeUtils";

const LOG_PREFIX = "[ListThemeNewspaper]";

/**
 * Newspaper theme - classic broadsheet front page layout
 * Inspired by The New York Times and traditional newspaper design
 *
 * Typography hierarchy:
 * - Masthead: Newspaper name (list title)
 * - Headline: Large serif ALL CAPS for #1 item
 * - Subheadlines: Smaller stories in column layout
 * - Articles: Justified text with bylines
 */
export default function ListThemeNewspaper({
  list,
  accentColor = "#1a1a1a", // Classic newspaper black
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  console.log(
    `${LOG_PREFIX} Rendering list: ${list?.title} with ${list?.items?.length} items`
  );

  if (!list || !list.items) {
    return (
      <div className="text-gray-500 font-serif italic">
        No stories to report...
      </div>
    );
  }

  // Split items into sections
  const headline = list.items[0]; // Main headline
  const aboveFold = list.items.slice(1, 4); // Above the fold stories
  const belowFold = list.items.slice(4); // Below the fold

  // Get current date for dateline
  const today = new Date();
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("en-US", dateOptions);

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
            <StarIcon className="h-4 w-4 text-gray-900" />
          ) : (
            <StarOutline className="h-4 w-4 text-gray-400" />
          )}
        </button>
      );
    }
    return stars;
  };

  // "Print reveal" animation for newspaper effect
  const printReveal = {
    initial: { opacity: 0, filter: "blur(2px)" },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const columnReveal = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.article
      className="max-w-5xl mx-auto font-serif"
      style={{
        backgroundColor: "#f5f5dc", // Off-white/newsprint color
        color: "#1a1a1a",
      }}
      initial="initial"
      animate="animate"
      variants={printReveal}
    >
      {/* Newspaper Container with paper texture feel */}
      <div className="px-6 py-8 md:px-12 md:py-10 shadow-xl">
        {/* Extra Banner (optional) */}
        <motion.div
          className="text-center mb-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span
            className="inline-block px-4 py-1 text-xs font-bold tracking-[0.3em] uppercase border-2 border-current"
            style={{ color: accentColor }}
          >
            Extra! Extra!
          </span>
        </motion.div>

        {/* Masthead / Newspaper Name */}
        <header className="text-center border-b-4 border-double border-gray-900 pb-4 mb-4">
          <motion.div variants={printReveal}>
            {/* Decorative line above masthead */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px bg-gray-900 grow max-w-16" />
              <span className="text-xs tracking-[0.2em] uppercase">
                The Definitive Rankings
              </span>
              <div className="h-px bg-gray-900 grow max-w-16" />
            </div>

            {/* Newspaper Title (List Title) */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase mb-2"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: "-0.02em",
              }}
            >
              {list.title || "The Daily List"}
            </h1>

            {/* Dateline */}
            <div className="flex items-center justify-center gap-8 text-xs tracking-wider uppercase">
              <span>{formattedDate}</span>
              {list.year && (
                <>
                  <span className="text-gray-400">|</span>
                  <span>Covering the Best of {list.year}</span>
                </>
              )}
              <span className="text-gray-400">|</span>
              <span>Vol. I, No. 1</span>
            </div>
          </motion.div>
        </header>

        {/* Thin decorative rule */}
        <div className="border-t border-gray-400 mb-6" />

        {/* ABOVE THE FOLD */}

        {/* Main Headline - #1 Item */}
        {headline && (
          <motion.section className="mb-8" variants={printReveal}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Headline Text Column */}
              <div className="lg:col-span-2">
                {/* Main Headline */}
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-tight mb-4"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {getTitle(headline)} CLAIMS TOP SPOT
                </h2>

                {/* Subheadline */}
                <p className="text-lg md:text-xl italic text-gray-700 mb-4 border-b border-gray-300 pb-4">
                  {list.description ||
                    `Critics and audiences agree: ${getTitle(headline)} is the undisputed champion of ${list.year || "the year"}`}
                </p>

                {/* Lead paragraph / Comment as article */}
                <div className="text-justify leading-relaxed">
                  {/* Byline */}
                  <p className="text-xs uppercase tracking-wider mb-3 text-gray-600">
                    By The Editors | {getYear(headline) || "Staff Report"}
                  </p>

                  {headline.comment ? (
                    isEditable ? (
                      <textarea
                        value={headline.comment}
                        onChange={(e) =>
                          onUpdateComment?.(headline.id, e.target.value)
                        }
                        placeholder="Write your lead story..."
                        className="w-full p-3 text-base leading-relaxed bg-transparent border border-gray-300 resize-none focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        style={{ textAlign: "justify" }}
                        rows={5}
                      />
                    ) : (
                      <p className="text-base leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none">
                        {headline.comment}
                      </p>
                    )
                  ) : isEditable ? (
                    <textarea
                      value=""
                      onChange={(e) =>
                        onUpdateComment?.(headline.id, e.target.value)
                      }
                      placeholder="Write your lead story about this selection..."
                      className="w-full p-3 text-base leading-relaxed bg-gray-100 border border-gray-300 resize-none focus:ring-2 focus:ring-gray-400 focus:outline-none"
                      rows={4}
                    />
                  ) : (
                    <p className="text-base leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none">
                      In a year filled with remarkable entries, one title has
                      risen above all others to claim the coveted top position.
                      {getTitle(headline)} has captivated audiences and critics
                      alike, earning its place in the annals of history.
                    </p>
                  )}

                  {/* Rating */}
                  {(headline.userRating || isEditable) && (
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-300">
                      <span className="text-xs uppercase tracking-wider text-gray-600">
                        Editor&apos;s Rating:
                      </span>
                      <div className="flex items-center gap-0.5">
                        {renderStars(headline.userRating, headline.id)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Image Column */}
              <div className="lg:col-span-1">
                <div className="relative aspect-[3/4] border-2 border-gray-900 overflow-hidden">
                  {hasImage(headline) ? (
                    <>
                      <Image
                        src={getImageUrl(headline, "xlarge")}
                        alt={getTitle(headline)}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        priority
                      />
                      {/* Image caption */}
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-2 py-1">
                        <p className="text-xs italic text-center">
                          {getTitle(headline)} ({getYear(headline)})
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-gray-500 text-sm italic">
                          Photo Unavailable
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Image not on file
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Rank badge */}
                <div
                  className="text-center mt-2 py-1 text-sm font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: accentColor,
                    color: "#f5f5dc",
                  }}
                >
                  #1 of {list.items.length}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Secondary Stories - Above the Fold */}
        {aboveFold.length > 0 && (
          <>
            {/* Section divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="grow h-px bg-gray-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-gray-600">
                Also Making Headlines
              </span>
              <div className="grow h-px bg-gray-400" />
            </div>

            <motion.section
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              variants={staggerContainerSlow}
              initial="initial"
              animate="animate"
            >
              {aboveFold.map((item, index) => (
                <motion.article
                  key={item.id}
                  variants={columnReveal}
                  className="border-r-0 md:border-r border-gray-300 last:border-r-0 pr-0 md:pr-4 last:pr-0"
                >
                  {/* Rank */}
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: accentColor }}
                  >
                    No. {item.rank || index + 2}
                  </p>

                  {/* Thumbnail */}
                  <div className="relative aspect-video mb-3 border border-gray-400 overflow-hidden">
                    {hasImage(item) ? (
                      <Image
                        src={getImageUrl(item, "medium")}
                        alt={getTitle(item)}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <p className="text-xs text-gray-500 italic">
                          Photo Unavailable
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg font-bold uppercase leading-tight mb-2">
                    {getTitle(item)}
                  </h3>

                  {/* Year/Subhead */}
                  <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider">
                    {getYear(item)}
                    {item.vote_average && ` | Rating: ${item.vote_average.toFixed(1)}`}
                  </p>

                  {/* Brief / Comment */}
                  <div className="text-sm leading-relaxed text-justify">
                    {item.comment ? (
                      isEditable ? (
                        <textarea
                          value={item.comment}
                          onChange={(e) =>
                            onUpdateComment?.(item.id, e.target.value)
                          }
                          className="w-full p-2 text-sm bg-transparent border border-gray-300 resize-none focus:ring-1 focus:ring-gray-400"
                          rows={3}
                        />
                      ) : (
                        <p>{truncateText(item.comment, 150)}</p>
                      )
                    ) : isEditable ? (
                      <textarea
                        value=""
                        onChange={(e) =>
                          onUpdateComment?.(item.id, e.target.value)
                        }
                        placeholder="Add story details..."
                        className="w-full p-2 text-sm bg-gray-100 border border-gray-300 resize-none focus:ring-1 focus:ring-gray-400"
                        rows={2}
                      />
                    ) : (
                      <p className="text-gray-600 italic">
                        Another standout entry that captured attention this
                        year.
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  {(item.userRating || isEditable) && (
                    <div className="flex items-center gap-1 mt-2">
                      {renderStars(item.userRating, item.id)}
                    </div>
                  )}
                </motion.article>
              ))}
            </motion.section>
          </>
        )}

        {/* BELOW THE FOLD */}
        {belowFold.length > 0 && (
          <>
            {/* Fold line */}
            <div className="relative my-8">
              <div className="border-t-2 border-dashed border-gray-400" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#f5f5dc] px-4 text-xs uppercase tracking-[0.2em] text-gray-500">
                Below the Fold
              </span>
            </div>

            <motion.section
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={staggerContainerSlow}
              initial="initial"
              animate="animate"
            >
              {belowFold.map((item, index) => (
                <motion.article
                  key={item.id}
                  variants={fadeInUp}
                  className="group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[2/3] mb-2 border border-gray-400 overflow-hidden">
                    {hasImage(item) ? (
                      <Image
                        src={getImageUrl(item, "medium")}
                        alt={getTitle(item)}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <p className="text-xs text-gray-500 italic text-center px-2">
                          Photo Unavailable
                        </p>
                      </div>
                    )}
                    {/* Rank overlay */}
                    <div
                      className="absolute top-0 left-0 px-2 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: accentColor,
                        color: "#f5f5dc",
                      }}
                    >
                      #{item.rank || index + 5}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold uppercase leading-tight mb-1 line-clamp-2">
                    {getTitle(item)}
                  </h4>

                  {/* Year */}
                  <p className="text-xs text-gray-600">{getYear(item)}</p>

                  {/* Rating */}
                  {(item.userRating || isEditable) && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {renderStars(item.userRating, item.id)}
                    </div>
                  )}

                  {/* Brief comment */}
                  {item.comment && !isEditable && (
                    <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">
                      {truncateText(item.comment, 60)}
                    </p>
                  )}
                  {isEditable && (
                    <textarea
                      value={item.comment || ""}
                      onChange={(e) =>
                        onUpdateComment?.(item.id, e.target.value)
                      }
                      placeholder="Brief..."
                      className="w-full mt-1 p-1 text-xs bg-transparent border border-gray-300 resize-none focus:ring-1 focus:ring-gray-400"
                      rows={2}
                    />
                  )}
                </motion.article>
              ))}
            </motion.section>
          </>
        )}

        {/* Footer / Colophon */}
        <footer className="mt-12 pt-6 border-t-2 border-gray-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-wider text-gray-600">
            <p>
              {list.items.length} Item{list.items.length !== 1 ? "s" : ""}{" "}
              Reviewed
            </p>
            <p className="font-bold" style={{ color: accentColor }}>
              Printed with Sortid
            </p>
            <p>{list.year ? `Best of ${list.year}` : "Special Edition"}</p>
          </div>

          {/* Decorative bottom border */}
          <div className="flex items-center gap-2 mt-4">
            <div className="grow h-1 bg-gray-900" />
            <div className="w-2 h-2 bg-gray-900 rotate-45" />
            <div className="grow h-1 bg-gray-900" />
          </div>
        </footer>
      </div>
    </motion.article>
  );
}
