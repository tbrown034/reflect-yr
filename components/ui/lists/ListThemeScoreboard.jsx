"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import {
  TrophyIcon,
  UserIcon,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import {
  getYear,
  getTitle,
  getImageUrl,
  slideInLeft,
  staggerContainerSlow,
} from "./themeUtils";

const LOG_PREFIX = "[ListThemeScoreboard]";

/**
 * Animated counter component that ticks up to a target value
 */
function AnimatedScore({ value, delay = 0 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      delay,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, delay, count, rounded]);

  return <span>{displayValue}</span>;
}

/**
 * Score bar component with animated fill
 */
function ScoreBar({ rating, accentColor, delay = 0 }) {
  const percentage = rating ? (rating / 5) * 100 : 0;

  return (
    <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden flex-1 min-w-[60px]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}40`,
        }}
      />
      {/* Grid lines for visual effect */}
      <div className="absolute inset-0 flex">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r border-gray-700 last:border-r-0"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Medal component for top 3 positions
 */
function Medal({ rank }) {
  const medals = {
    1: {
      bg: "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600",
      text: "text-yellow-900",
      shadow: "shadow-yellow-400/50",
      icon: true, // Crown for #1
    },
    2: {
      bg: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
      text: "text-gray-800",
      shadow: "shadow-gray-400/50",
      icon: false,
    },
    3: {
      bg: "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800",
      text: "text-amber-100",
      shadow: "shadow-amber-600/50",
      icon: false,
    },
  };

  const medal = medals[rank];
  if (!medal) return null;

  return (
    <div
      className={`relative w-10 h-10 ${medal.bg} rounded-full flex items-center justify-center font-bold ${medal.text} shadow-lg ${medal.shadow}`}
    >
      {medal.icon && (
        <TrophyIcon className="absolute -top-3 w-5 h-5 text-yellow-400 drop-shadow-lg" />
      )}
      <span className="font-mono text-lg">{rank}</span>
    </div>
  );
}

/**
 * Scoreboard/Leaderboard theme - gaming/esports style with score animations
 * Dark themed only with neon accents
 */
export default function ListThemeScoreboard({
  list,
  accentColor = "#00FF88", // Neon green by default
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  console.log(
    `${LOG_PREFIX} Rendering: ${list?.title} with ${list?.items?.length} items`
  );

  if (!list || !list.items) {
    return <div className="text-gray-500">No list data</div>;
  }

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
            <StarSolid className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarOutline className="h-4 w-4 text-gray-600" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="bg-gray-950 rounded-2xl p-6 md:p-8 overflow-hidden">
      {/* Scanline overlay effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="w-2 h-8 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}60`,
            }}
          />
          <h1
            className="text-3xl md:text-4xl font-bold font-mono uppercase tracking-wider"
            style={{
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}60`,
            }}
          >
            {list.title}
          </h1>
          <div
            className="w-2 h-8 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}60`,
            }}
          />
        </div>

        {list.year && (
          <div
            className="inline-block px-4 py-1 rounded-full text-sm font-mono border"
            style={{
              borderColor: accentColor,
              color: accentColor,
            }}
          >
            SEASON {list.year}
          </div>
        )}

        {list.description && (
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm">
            {list.description}
          </p>
        )}
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="space-y-2"
      >
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-mono uppercase tracking-wider text-gray-500 border-b border-gray-800">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-4">Score</div>
          <div className="col-span-2 text-right">Points</div>
        </div>

        {/* Rows */}
        {list.items.map((item, index) => {
          const rank = item.rank || index + 1;
          const isTopThree = rank <= 3;
          const points = item.userRating ? item.userRating * 20 : 0;
          const imageUrl = getImageUrl(item, "small");

          return (
            <motion.div
              key={item.id}
              variants={slideInLeft}
              transition={{ delay: index * 0.08 }}
              className={`relative grid grid-cols-12 gap-2 md:gap-4 items-center p-3 md:p-4 rounded-xl transition-all ${
                isTopThree
                  ? "bg-gradient-to-r from-gray-900 to-gray-800"
                  : "bg-gray-900/50 hover:bg-gray-900"
              }`}
              style={
                isTopThree
                  ? {
                      borderLeft: `3px solid ${accentColor}`,
                      boxShadow: `inset 0 0 30px ${accentColor}10`,
                    }
                  : {}
              }
            >
              {/* Rank */}
              <div className="col-span-2 md:col-span-1 flex justify-center">
                {isTopThree ? (
                  <Medal rank={rank} />
                ) : (
                  <span className="font-mono text-xl text-gray-500 font-bold">
                    {rank}
                  </span>
                )}
              </div>

              {/* Avatar/Poster + Name */}
              <div className="col-span-10 md:col-span-5 flex items-center gap-3">
                <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 relative rounded-lg overflow-hidden bg-gray-800 ring-2 ring-gray-700">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={getTitle(item)}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate text-sm md:text-base">
                    {getTitle(item)}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {getYear(item) || "N/A"}
                  </p>
                </div>
              </div>

              {/* Score Bar - Hidden on mobile, shows in points column */}
              <div className="hidden md:flex col-span-4 items-center gap-3">
                <ScoreBar
                  rating={item.userRating}
                  accentColor={accentColor}
                  delay={index * 0.1}
                />
                <div className="flex items-center gap-0.5">
                  {renderStars(item.userRating, item.id)}
                </div>
              </div>

              {/* Points */}
              <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0">
                {/* Mobile: Show stars here */}
                <div className="flex md:hidden items-center gap-0.5">
                  {renderStars(item.userRating, item.id)}
                </div>

                <div
                  className="font-mono text-xl md:text-2xl font-bold"
                  style={{
                    color: accentColor,
                    textShadow: points > 0 ? `0 0 10px ${accentColor}60` : "none",
                  }}
                >
                  <AnimatedScore value={points} delay={index * 0.1 + 0.3} />
                  <span className="text-xs text-gray-500 ml-1">PTS</span>
                </div>
              </div>

              {/* Comment - Full width row */}
              {(isEditable || item.comment) && (
                <div className="col-span-12 mt-2 pl-0 md:pl-16">
                  {isEditable ? (
                    <textarea
                      value={item.comment || ""}
                      onChange={(e) => onUpdateComment?.(item.id, e.target.value)}
                      placeholder="Add player notes..."
                      className="w-full p-2 text-sm bg-gray-800 text-gray-300 rounded-lg border border-gray-700 resize-none focus:ring-2 focus:border-transparent font-mono"
                      style={{ focusRing: accentColor }}
                      rows={1}
                    />
                  ) : (
                    item.comment && (
                      <p className="text-gray-400 text-sm italic font-mono">
                        // {item.comment}
                      </p>
                    )
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap justify-center gap-6 text-center"
      >
        <div>
          <div
            className="font-mono text-2xl font-bold"
            style={{ color: accentColor }}
          >
            {list.items.length}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Players
          </div>
        </div>
        <div>
          <div
            className="font-mono text-2xl font-bold"
            style={{ color: accentColor }}
          >
            {list.items.reduce((acc, item) => acc + (item.userRating || 0) * 20, 0)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Total Points
          </div>
        </div>
        <div>
          <div
            className="font-mono text-2xl font-bold"
            style={{ color: accentColor }}
          >
            {list.items.filter((item) => item.userRating === 5).length}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Perfect Scores
          </div>
        </div>
      </motion.div>
    </div>
  );
}
