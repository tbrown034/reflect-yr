"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  getYear,
  getTitle,
  getImageUrl,
  hasImage,
  getContrastColor,
  darkenColor,
  lightenColor,
  renderStarsString,
  fallbackImageStyles,
} from "./themeUtils";

const LOG_PREFIX = "[ListThemeWrapped]";

/**
 * Wrapped theme - Spotify Wrapped style vertical story cards
 * Each item is a full-screen "story" with swipe/click navigation
 */
export default function ListThemeWrapped({
  list,
  accentColor = "#3B82F6",
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  console.log(
    `${LOG_PREFIX} Rendering: ${list?.title}, current: ${currentIndex + 1}/${list?.items?.length}`
  );

  if (!list || !list.items || list.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        No list data
      </div>
    );
  }

  const items = list.items;
  const totalItems = items.length;
  const currentItem = items[currentIndex];

  // Navigation handlers
  const goToNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalItems]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToIndex = useCallback((index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // Click zones for navigation (left third = back, right two-thirds = forward)
  const handleCardClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const thirdWidth = rect.width / 3;

    if (clickX < thirdWidth) {
      goToPrev();
    } else {
      goToNext();
    }
  };

  // Generate gradient background from accent color
  const gradientBg = `linear-gradient(180deg, ${darkenColor(accentColor, 30)} 0%, ${accentColor} 50%, ${lightenColor(accentColor, 10)} 100%)`;
  const textColor = getContrastColor(accentColor);

  // Animation variants for story transitions
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  // Render star rating controls
  const renderStars = (rating, itemId) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = rating && i <= rating;
      stars.push(
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            if (isEditable) onUpdateRating?.(itemId, i);
          }}
          disabled={!isEditable}
          className={`${isEditable ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          {isFilled ? (
            <StarIcon className="h-8 w-8 text-yellow-400 drop-shadow-lg" />
          ) : (
            <StarOutline
              className="h-8 w-8 drop-shadow-lg"
              style={{ color: textColor === "#FFFFFF" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)" }}
            />
          )}
        </button>
      );
    }
    return stars;
  };

  // Format rank with leading zero
  const formatRank = (rank) => {
    return String(rank).padStart(2, "0");
  };

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
      {/* Story Container - Fixed aspect ratio like Instagram stories */}
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
        style={{ aspectRatio: "9/16" }}
      >
        {/* Progress dots at top */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToIndex(index);
              }}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  index <= currentIndex
                    ? textColor
                    : textColor === "#FFFFFF"
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(0,0,0,0.2)",
              }}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>

        {/* Main Story Card */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={handleCardClick}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 flex flex-col"
              style={{ background: gradientBg }}
            >
              {/* Background Image (blurred) */}
              {hasImage(currentItem) && (
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={getImageUrl(currentItem, "large")}
                    alt=""
                    fill
                    sizes="(max-width: 448px) 100vw, 448px"
                    className="object-cover opacity-20 blur-xl scale-110"
                    priority={currentIndex === 0}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: gradientBg, opacity: 0.85 }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full px-6 pt-12 pb-8">
                {/* List title (subtle) */}
                <div className="text-center mb-4">
                  <p
                    className="text-sm font-medium opacity-70 uppercase tracking-widest"
                    style={{ color: textColor }}
                  >
                    {list.title}
                  </p>
                  {list.year && (
                    <p
                      className="text-xs opacity-50 mt-1"
                      style={{ color: textColor }}
                    >
                      {list.year}
                    </p>
                  )}
                </div>

                {/* Giant Rank Number */}
                <div className="flex-shrink-0 text-center my-4">
                  <motion.span
                    key={`rank-${currentIndex}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="text-8xl font-black tracking-tighter drop-shadow-2xl"
                    style={{
                      color: textColor,
                      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {formatRank(currentItem.rank || currentIndex + 1)}
                  </motion.span>
                </div>

                {/* Poster */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex-shrink-0 mx-auto mb-6"
                >
                  <div
                    className="relative rounded-xl overflow-hidden shadow-2xl"
                    style={{ width: 180, height: 270 }}
                  >
                    {hasImage(currentItem) ? (
                      <Image
                        src={getImageUrl(currentItem, "large")}
                        alt={getTitle(currentItem)}
                        fill
                        sizes="180px"
                        className="object-cover"
                        priority={currentIndex < 3}
                      />
                    ) : (
                      <div className={fallbackImageStyles.container}>
                        <span className={fallbackImageStyles.text}>
                          {getTitle(currentItem)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-center mb-2 px-2"
                  style={{ color: textColor }}
                >
                  {getTitle(currentItem)}
                </motion.h2>

                {/* Year */}
                {getYear(currentItem) && (
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="text-center text-lg opacity-70 mb-4"
                    style={{ color: textColor }}
                  >
                    {getYear(currentItem)}
                  </motion.p>
                )}

                {/* User Rating */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center gap-1 mb-4"
                >
                  {renderStars(currentItem.userRating, currentItem.id)}
                </motion.div>

                {/* Comment */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex-grow flex items-end justify-center"
                >
                  {isEditable ? (
                    <textarea
                      value={currentItem.comment || ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        onUpdateComment?.(currentItem.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Add your thoughts..."
                      className="w-full p-3 text-sm rounded-xl resize-none focus:ring-2 focus:ring-white/30 focus:outline-none"
                      style={{
                        backgroundColor:
                          textColor === "#FFFFFF"
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(255,255,255,0.3)",
                        color: textColor,
                      }}
                      rows={2}
                    />
                  ) : (
                    currentItem.comment && (
                      <p
                        className="text-center text-sm italic opacity-90 px-4 py-3 rounded-xl max-w-full"
                        style={{
                          color: textColor,
                          backgroundColor:
                            textColor === "#FFFFFF"
                              ? "rgba(0,0,0,0.2)"
                              : "rgba(255,255,255,0.2)",
                        }}
                      >
                        "{currentItem.comment}"
                      </p>
                    )
                  )}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows (visible on hover/focus) */}
        <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity z-30">
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}
        </div>
        <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity z-30">
          {currentIndex < totalItems - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
              aria-label="Next item"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Position indicator below card */}
      <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
        <span className="font-bold" style={{ color: accentColor }}>
          {currentIndex + 1}
        </span>
        <span className="mx-1">/</span>
        <span>{totalItems}</span>
      </div>

      {/* Keyboard hint */}
      <p className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
        Tap to navigate or use arrow keys
      </p>
    </div>
  );
}
