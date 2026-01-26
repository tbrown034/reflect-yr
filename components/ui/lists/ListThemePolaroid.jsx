"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import {
  getYear,
  getTitle,
  getImageUrl,
  hasImage,
  scaleIn,
  staggerContainer,
} from "./themeUtils";

const LOG_PREFIX = "[ListThemePolaroid]";

/**
 * Polaroid theme - nostalgic photo wall with scattered instant photos
 * Items appear as polaroid photos with handwritten captions and slight rotations
 */
export default function ListThemePolaroid({
  list,
  accentColor = "#3B82F6",
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  console.log(
    `${LOG_PREFIX} Rendering polaroid wall: ${list?.title} with ${list?.items?.length} items`
  );

  // Generate consistent random rotations for each item based on index
  const rotations = useMemo(() => {
    if (!list?.items) return [];
    return list.items.map((_, index) => {
      // Use index-based pseudo-random for consistency across renders
      const seed = (index * 7 + 3) % 13;
      return ((seed / 13) * 6 - 3).toFixed(1); // Range: -3 to 3 degrees
    });
  }, [list?.items]);

  if (!list || !list.items) {
    return <div className="text-gray-500">No list data</div>;
  }

  const renderHandwrittenStars = (rating, itemId) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = rating && i <= rating;
      stars.push(
        <button
          key={i}
          onClick={() => isEditable && onUpdateRating?.(itemId, i)}
          disabled={!isEditable}
          className={`${
            isEditable ? "cursor-pointer hover:scale-125" : "cursor-default"
          } transition-transform`}
          aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
        >
          {isFilled ? (
            <StarIcon className="h-4 w-4 text-amber-500 drop-shadow-sm" />
          ) : (
            <StarOutline className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen">
      {/* Cork board background effect */}
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-10 pt-4">
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              fontFamily:
                "'Caveat', 'Permanent Marker', 'Comic Sans MS', cursive",
              color: accentColor,
            }}
          >
            {list.title}
          </h1>
          {list.description && (
            <p
              className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto italic"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              {list.description}
            </p>
          )}
          {list.year && (
            <span
              className="inline-block mt-3 px-4 py-1.5 rounded-sm text-white font-medium shadow-md"
              style={{
                backgroundColor: accentColor,
                fontFamily: "'Caveat', cursive",
                fontSize: "1.25rem",
              }}
            >
              {list.year}
            </span>
          )}
        </div>

        {/* Polaroid Grid - Masonry-like with scattered rotations */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 px-4 pb-8"
        >
          {list.items.map((item, index) => (
            <PolaroidCard
              key={item.id}
              item={item}
              index={index}
              rotation={rotations[index]}
              accentColor={accentColor}
              isEditable={isEditable}
              onUpdateComment={onUpdateComment}
              renderStars={() => renderHandwrittenStars(item.userRating, item.id)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Individual polaroid card component
 */
function PolaroidCard({
  item,
  index,
  rotation,
  accentColor,
  isEditable,
  onUpdateComment,
  renderStars,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localComment, setLocalComment] = useState(item.comment || "");

  const imageUrl = getImageUrl(item, "large");
  const title = getTitle(item);
  const year = getYear(item);

  const handleCommentBlur = () => {
    setIsEditing(false);
    if (localComment !== item.comment) {
      onUpdateComment?.(item.id, localComment);
    }
  };

  return (
    <motion.div
      variants={scaleIn}
      transition={{ delay: index * 0.04 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer"
      style={{
        transformOrigin: "center center",
      }}
    >
      <motion.div
        animate={{
          rotate: isHovered ? 0 : parseFloat(rotation),
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -8 : 0,
          zIndex: isHovered ? 10 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="relative bg-white dark:bg-gray-100 p-2 pb-14 md:pb-16 rounded-sm shadow-lg hover:shadow-2xl"
        style={{
          // Polaroid frame shadow effect
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.05)"
            : "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Rank - handwritten style in corner */}
        <div
          className="absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md z-20"
          style={{
            backgroundColor: accentColor,
            fontFamily: "'Caveat', 'Permanent Marker', cursive",
            fontSize: "1.5rem",
          }}
        >
          {item.rank || index + 1}
        </div>

        {/* Photo area */}
        <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-300 overflow-hidden">
          {hasImage(item) && imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderSketch title={title} />
          )}

          {/* Subtle photo grain overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Caption area - bottom of polaroid */}
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-1 bg-white dark:bg-gray-100">
          {/* Title - handwritten style */}
          <h3
            className="text-gray-800 font-medium truncate text-sm md:text-base"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            {title}
          </h3>

          {/* Year */}
          {year && (
            <p
              className="text-gray-500 text-xs"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              {year}
            </p>
          )}

          {/* User Rating - drawn stars */}
          {(item.userRating || isEditable) && (
            <div className="flex items-center gap-0.5 mt-1">{renderStars()}</div>
          )}

          {/* Comment - handwritten caption */}
          {isEditable ? (
            <textarea
              value={localComment}
              onChange={(e) => setLocalComment(e.target.value)}
              onFocus={() => setIsEditing(true)}
              onBlur={handleCommentBlur}
              placeholder="Add a note..."
              className="mt-1 w-full p-1 text-xs bg-transparent border-b border-dashed border-gray-300 text-gray-600 resize-none focus:outline-none focus:border-gray-500"
              style={{ fontFamily: "'Caveat', cursive" }}
              rows={2}
            />
          ) : (
            item.comment && (
              <p
                className="mt-1 text-gray-600 text-xs italic line-clamp-2"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {item.comment}
              </p>
            )
          )}
        </div>

        {/* Push pin effect on top */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-md z-10"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${accentColor}, ${accentColor}aa)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Placeholder sketch for items without images
 */
function PlaceholderSketch({ title }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-200 p-4">
      {/* Simple sketch-style placeholder */}
      <svg
        viewBox="0 0 60 80"
        className="w-12 h-16 text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Film frame */}
        <rect x="5" y="5" width="50" height="70" rx="2" />
        {/* Film holes */}
        <circle cx="12" cy="12" r="3" />
        <circle cx="48" cy="12" r="3" />
        <circle cx="12" cy="68" r="3" />
        <circle cx="48" cy="68" r="3" />
        {/* Center image area */}
        <rect x="12" y="20" width="36" height="35" rx="1" />
        {/* Mountains/landscape sketch */}
        <path d="M15 50 L25 35 L35 45 L45 30" />
        {/* Sun */}
        <circle cx="40" cy="28" r="4" />
      </svg>
      <span
        className="text-gray-500 text-xs mt-2 text-center"
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        No photo
      </span>
    </div>
  );
}
