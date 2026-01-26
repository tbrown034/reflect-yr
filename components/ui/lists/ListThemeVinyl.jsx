"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import {
  getYear,
  getTitle,
  getImageUrl,
  hasImage,
  slideInLeft,
  staggerContainerSlow,
  getContrastColor,
  darkenColor,
} from "./themeUtils";

const LOG_PREFIX = "[ListThemeVinyl]";

/**
 * Convert user rating (1-5) to "track runtime" format (e.g., "3:45")
 */
function ratingToRuntime(rating) {
  if (!rating || rating < 1) return "--:--";
  // Map 1-5 rating to minute values, with some variation
  const minutes = Math.floor(rating);
  const seconds = Math.round((rating % 1) * 60) || Math.floor(Math.random() * 50 + 10);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Vinyl Record theme - Album sleeve aesthetic with spinning vinyl records
 * Displays list as a record collection with Side A/Side B track listings
 */
export default function ListThemeVinyl({
  list,
  accentColor = "#3B82F6",
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  console.log(`${LOG_PREFIX} Rendering list: ${list?.title} with ${list?.items?.length} items`);

  const [hoveredRecord, setHoveredRecord] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  if (!list || !list.items) {
    return <div className="text-gray-500">No list data</div>;
  }

  // Split items into Side A (1-5) and Side B (6-10)
  const sideA = list.items.slice(0, 5);
  const sideB = list.items.slice(5, 10);

  // Vinyl grooves pattern (concentric circles)
  const VinylGrooves = ({ isSpinning }) => (
    <motion.div
      className="absolute inset-0 rounded-full overflow-hidden"
      animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
      transition={isSpinning ? { duration: 3, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
    >
      {/* Vinyl grooves - concentric circles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-gray-800/30"
          style={{
            inset: `${i * 2.2}%`,
            borderWidth: i % 3 === 0 ? "1px" : "0.5px",
          }}
        />
      ))}
      {/* Vinyl shine/reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
    </motion.div>
  );

  // Record label center design
  const RecordLabel = ({ accentColor, listTitle }) => (
    <div
      className="absolute rounded-full flex items-center justify-center"
      style={{
        width: "35%",
        height: "35%",
        top: "32.5%",
        left: "32.5%",
        backgroundColor: accentColor,
      }}
    >
      {/* Label inner ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: "80%",
          height: "80%",
          border: `2px solid ${darkenColor(accentColor, 20)}`,
        }}
      />
      {/* Center hole */}
      <div className="absolute w-3 h-3 rounded-full bg-gray-900" />
      {/* Label text */}
      <span
        className="absolute text-[8px] font-bold uppercase tracking-widest"
        style={{
          color: getContrastColor(accentColor),
          top: "25%",
        }}
      >
        Sortid
      </span>
    </div>
  );

  // Album sleeve component
  const AlbumSleeve = ({ item, index, isHovered }) => {
    const imageUrl = getImageUrl(item, "large");
    const title = getTitle(item);
    const year = getYear(item);

    return (
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => setHoveredRecord(item.id)}
        onMouseLeave={() => setHoveredRecord(null)}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
      >
        {/* Album sleeve container - square aspect ratio */}
        <div className="relative aspect-square rounded-sm overflow-hidden shadow-xl bg-gray-800">
          {/* Album cover */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-gray-600 flex items-center justify-center">
                  <span className="text-2xl">♫</span>
                </div>
                <span className="text-gray-400 text-sm font-medium">{title}</span>
              </div>
            </div>
          )}

          {/* Rank badge */}
          <div
            className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
            style={{
              backgroundColor: accentColor,
              color: getContrastColor(accentColor),
            }}
          >
            {item.rank || index + 1}
          </div>

          {/* Worn edge overlay */}
          <div className="absolute inset-0 pointer-events-none border-4 border-white/5 rounded-sm" />
        </div>

        {/* Vinyl record peeking out on hover */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full bg-gray-900 shadow-2xl"
          style={{ right: "-10%" }}
          initial={{ x: "0%" }}
          animate={{ x: isHovered ? "40%" : "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <VinylGrooves isSpinning={isHovered} />
          <RecordLabel accentColor={accentColor} listTitle={list.title} />
        </motion.div>

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
          <h3 className="font-semibold text-white text-sm line-clamp-1">
            {title}
          </h3>
          {year && (
            <p className="text-gray-300 text-xs">{year}</p>
          )}
        </div>
      </motion.div>
    );
  };

  // Track listing row component
  const TrackRow = ({ item, index, side }) => {
    const title = getTitle(item);
    const isExpanded = expandedItem === item.id;
    const trackNumber = side === "A" ? index + 1 : index + 6;

    const renderStars = (rating, itemId) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        const isFilled = rating && i <= rating;
        stars.push(
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              isEditable && onUpdateRating?.(itemId, i);
            }}
            disabled={!isEditable}
            className={`${isEditable ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            {isFilled ? (
              <StarIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarOutline className="h-4 w-4 text-gray-500" />
            )}
          </button>
        );
      }
      return stars;
    };

    return (
      <motion.div
        variants={slideInLeft}
        className="group"
      >
        <div
          className={`flex items-center gap-3 py-3 px-4 cursor-pointer transition-colors rounded-lg ${
            isExpanded
              ? "bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
          onClick={() => setExpandedItem(isExpanded ? null : item.id)}
        >
          {/* Track number in circle */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              backgroundColor: accentColor,
              color: getContrastColor(accentColor),
            }}
          >
            {trackNumber}
          </div>

          {/* Track title */}
          <div className="flex-grow min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h4>
            {item.comment && !isExpanded && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate italic">
                {item.comment}
              </p>
            )}
          </div>

          {/* Runtime (from rating) */}
          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono shrink-0">
            {ratingToRuntime(item.userRating)}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4 pt-2 bg-gray-100 dark:bg-gray-800 rounded-b-lg -mt-2"
          >
            {/* Star rating */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Your rating:</span>
              <div className="flex items-center gap-0.5">
                {renderStars(item.userRating, item.id)}
              </div>
            </div>

            {/* Comment */}
            {isEditable ? (
              <textarea
                value={item.comment || ""}
                onChange={(e) => onUpdateComment?.(item.id, e.target.value)}
                placeholder="Add liner notes..."
                onClick={(e) => e.stopPropagation()}
                className="w-full p-2 text-sm bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            ) : (
              item.comment && (
                <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                  "{item.comment}"
                </p>
              )
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Album Header - Record Label Style */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-2xl p-8 overflow-hidden">
        {/* Wood grain texture overlay for dark mode */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(139,90,43,0.3)_2px,rgba(139,90,43,0.3)_4px)]" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Large vinyl record decoration */}
          <div className="relative w-48 h-48 shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full bg-gray-900 shadow-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <VinylGrooves isSpinning={false} />
              <RecordLabel accentColor={accentColor} listTitle={list.title} />
            </motion.div>
          </div>

          {/* Album info */}
          <div className="text-center md:text-left">
            <p className="text-gray-400 uppercase tracking-widest text-xs mb-2">
              {list.type || "Collection"} Album
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold mb-3"
              style={{ color: accentColor }}
            >
              {list.title}
            </h1>
            {list.description && (
              <p className="text-gray-400 text-lg italic max-w-xl">
                {list.description}
              </p>
            )}
            {list.year && (
              <p className="mt-4 text-gray-500">
                <span className="uppercase tracking-wider text-xs">Originally Released:</span>{" "}
                <span className="font-bold text-white">{list.year}</span>
              </p>
            )}
            <p className="mt-2 text-gray-500 text-sm">
              {list.items.length} Tracks
            </p>
          </div>
        </div>
      </div>

      {/* Record Crate - Album Grid */}
      <div className="bg-gradient-to-b from-amber-900/20 to-amber-950/30 dark:from-amber-900/10 dark:to-gray-900/50 rounded-2xl p-6 border border-amber-800/20">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
          Record Crate
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {list.items.map((item, index) => (
            <AlbumSleeve
              key={item.id}
              item={item}
              index={index}
              isHovered={hoveredRecord === item.id}
            />
          ))}
        </div>
      </div>

      {/* Track Listing */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Side A */}
        {sideA.length > 0 && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: accentColor,
                  color: getContrastColor(accentColor),
                }}
              >
                A
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Side A</h2>
            </div>
            <motion.div
              className="space-y-1"
              variants={staggerContainerSlow}
              initial="initial"
              animate="animate"
            >
              {sideA.map((item, index) => (
                <TrackRow key={item.id} item={item} index={index} side="A" />
              ))}
            </motion.div>
          </div>
        )}

        {/* Side B */}
        {sideB.length > 0 && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: darkenColor(accentColor, 15),
                  color: getContrastColor(accentColor),
                }}
              >
                B
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Side B</h2>
            </div>
            <motion.div
              className="space-y-1"
              variants={staggerContainerSlow}
              initial="initial"
              animate="animate"
            >
              {sideB.map((item, index) => (
                <TrackRow key={item.id} item={item} index={index} side="B" />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Album Credits */}
      {list.description && (
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 text-center">
          <h3 className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
            Liner Notes
          </h3>
          <p className="text-gray-700 dark:text-gray-300 italic max-w-2xl mx-auto">
            "{list.description}"
          </p>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            Curated with Sortid
          </p>
        </div>
      )}
    </div>
  );
}
