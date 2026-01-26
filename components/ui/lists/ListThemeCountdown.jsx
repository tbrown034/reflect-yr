"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  HandRaisedIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { getYear, getTitle, getImageUrl } from "./themeUtils";

const LOG_PREFIX = "[ListThemeCountdown]";

// Pre-generated confetti particles (deterministic for SSR)
const CONFETTI_COLORS = ["#FFD700", "#FFA500", "#FF6347", "#00CED1", "#9370DB", "#98FB98"];
const CONFETTI_PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: (i * 7 + 13) % 100, // Pseudo-random distribution
  delay: (i * 0.01) % 0.5,
  duration: 2 + (i % 3),
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 4 + (i % 9),
  rotation: (i * 37) % 360,
}));

// Pre-generated star positions (deterministic for SSR)
const STAR_POSITIONS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: (i * 17 + 23) % 100,
  top: (i * 31 + 7) % 100,
  duration: 2 + (i % 3),
  delay: (i * 0.04) % 2,
}));

// Confetti particle component
function Confetti({ isActive }) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {CONFETTI_PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: "100vh",
            rotate: particle.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.size > 8 ? "2px" : "50%",
          }}
        />
      ))}
    </div>
  );
}

// Sparkle burst effect
function SparklesBurst({ isActive }) {
  if (!isActive) return null;

  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) * (Math.PI / 180),
    delay: i * 0.02,
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos(sparkle.angle) * 150,
            y: Math.sin(sparkle.angle) * 150,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: sparkle.delay,
            ease: "easeOut",
          }}
          className="absolute"
        >
          <SparklesIcon className="w-6 h-6 text-yellow-400" />
        </motion.div>
      ))}
    </div>
  );
}

// Large countdown number display
function CountdownNumber({ number, isAnimating: _isAnimating }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={number}
        initial={{ scale: 3, opacity: 0, rotateX: -90 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotateX: 90 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600 drop-shadow-2xl"
        style={{
          textShadow: "0 0 40px rgba(255, 215, 0, 0.5), 0 0 80px rgba(255, 165, 0, 0.3)",
          WebkitTextStroke: "2px rgba(255, 215, 0, 0.3)",
        }}
      >
        {number}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Countdown theme - New Year's Eve style reveal with countdown animation
 * Think Times Square ball drop meets David Letterman's Top 10
 */
export default function ListThemeCountdown({
  list,
  accentColor: _accentColor = "#FFD700", // Gold default (NYE theme uses gold/silver)
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [currentCountdown, setCurrentCountdown] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [celebrationItem, setCelebrationItem] = useState(null);

  // Sort items by rank (highest first for countdown effect)
  const sortedItems = useMemo(() => {
    if (!list?.items) return [];
    return [...list.items].sort((a, b) => {
      const rankA = a.rank || list.items.indexOf(a) + 1;
      const rankB = b.rank || list.items.indexOf(b) + 1;
      return rankB - rankA; // Descending order (10, 9, 8... 1)
    });
  }, [list?.items]);

  const totalItems = sortedItems.length;
  const nextToReveal = sortedItems.findIndex(
    (_, idx) => !revealedIndices.has(idx)
  );
  const allRevealed = revealedIndices.size === totalItems && totalItems > 0;

  // Get the rank number for display (countdown style)
  const getDisplayRank = useCallback(
    (item, index) => {
      return item.rank || totalItems - index;
    },
    [totalItems]
  );

  // Reveal next item with animation
  const revealNext = useCallback(() => {
    if (nextToReveal === -1 || allRevealed) return;

    const item = sortedItems[nextToReveal];
    const rank = getDisplayRank(item, nextToReveal);

    // Show countdown number
    setCurrentCountdown(rank);

    // After countdown animation, reveal the item
    setTimeout(() => {
      setRevealedIndices((prev) => new Set([...prev, nextToReveal]));
      setCurrentCountdown(null);

      // Check if this is #1 (the winner!)
      if (rank === 1) {
        setShowConfetti(true);
        setShowSparkles(true);
        setCelebrationItem(item);
        setIsAutoPlaying(false);

        // Clear celebration effects after a delay
        setTimeout(() => {
          setShowConfetti(false);
          setShowSparkles(false);
        }, 4000);
      }
    }, 800);
  }, [nextToReveal, allRevealed, sortedItems, getDisplayRank]);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || allRevealed) return;

    const timer = setTimeout(() => {
      revealNext();
    }, 2000); // 2 second interval between reveals

    return () => clearTimeout(timer);
  }, [isAutoPlaying, allRevealed, revealNext]);

  console.log(
    `${LOG_PREFIX} Rendering: ${list?.title}, revealed: ${revealedIndices.size}, autoPlay: ${isAutoPlaying}`
  );

  if (!list || !list.items) {
    return <div className="text-gray-500">No list data</div>;
  }

  const startAutoPlay = () => {
    console.log(`${LOG_PREFIX} Starting auto-play countdown`);
    setIsAutoPlaying(true);
    if (revealedIndices.size === 0) {
      revealNext(); // Start immediately
    }
  };

  const pauseAutoPlay = () => {
    console.log(`${LOG_PREFIX} Pausing auto-play`);
    setIsAutoPlaying(false);
  };

  const reset = () => {
    console.log(`${LOG_PREFIX} Resetting countdown`);
    setRevealedIndices(new Set());
    setCurrentCountdown(null);
    setIsAutoPlaying(false);
    setShowConfetti(false);
    setShowSparkles(false);
    setCelebrationItem(null);
  };

  const revealAll = () => {
    console.log(`${LOG_PREFIX} Revealing all items`);
    setRevealedIndices(new Set(sortedItems.map((_, i) => i)));
    setIsAutoPlaying(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

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
            <StarIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarOutline className="h-5 w-5 text-gray-500" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Confetti effect */}
      <Confetti isActive={showConfetti} />

      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STAR_POSITIONS.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 bg-clip-text text-transparent"
          >
            {list.title}
          </motion.h1>
          {list.description && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg mb-4"
            >
              {list.description}
            </motion.p>
          )}
          {list.year && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-400 font-semibold"
            >
              {list.year}
            </motion.span>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {!allRevealed && (
            <>
              {isAutoPlaying ? (
                <button
                  onClick={pauseAutoPlay}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-orange-600/30"
                >
                  <PauseIcon className="h-5 w-5" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={startAutoPlay}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-500/30"
                >
                  <PlayIcon className="h-5 w-5" />
                  Auto Countdown
                </button>
              )}
              <button
                onClick={revealNext}
                disabled={isAutoPlaying}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                <HandRaisedIcon className="h-5 w-5" />
                Reveal Next
              </button>
            </>
          )}
          <button
            onClick={revealAll}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <SparklesIcon className="h-5 w-5" />
            Reveal All
          </button>
          {revealedIndices.size > 0 && (
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Reset
            </button>
          )}
        </div>

        {/* Countdown number overlay */}
        <AnimatePresence>
          {currentCountdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <CountdownNumber number={currentCountdown} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* List items */}
        <div className="space-y-4">
          {sortedItems.map((item, index) => {
            const isRevealed = revealedIndices.has(index);
            const rank = getDisplayRank(item, index);
            const isWinner = rank === 1 && isRevealed;
            const imageUrl = getImageUrl(item, "medium");

            return (
              <div key={item.id || index} className="relative">
                <AnimatePresence mode="wait">
                  {isRevealed ? (
                    <motion.div
                      key="revealed"
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className={`relative overflow-hidden rounded-2xl ${
                        isWinner
                          ? "bg-gradient-to-r from-yellow-900/50 via-yellow-800/30 to-yellow-900/50 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/30"
                          : "bg-gray-800/80 border border-gray-700"
                      }`}
                    >
                      {/* Winner sparkles */}
                      {isWinner && <SparklesBurst isActive={showSparkles} />}

                      {/* Glow effect for winner */}
                      {isWinner && (
                        <motion.div
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20"
                        />
                      )}

                      <div className="relative flex items-center gap-4 p-4">
                        {/* Rank badge */}
                        <motion.div
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className={`shrink-0 w-16 h-16 rounded-xl flex items-center justify-center font-black text-3xl ${
                            isWinner
                              ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-500/50"
                              : "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
                          }`}
                        >
                          {rank}
                        </motion.div>

                        {/* Poster */}
                        <div
                          className={`shrink-0 w-16 h-24 relative rounded-lg overflow-hidden ${
                            isWinner ? "ring-2 ring-yellow-500" : ""
                          }`}
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={getTitle(item)}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <span className="text-2xl font-bold text-gray-500">
                                {rank}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="grow min-w-0">
                          <motion.h3
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`font-bold text-lg md:text-xl ${
                              isWinner ? "text-yellow-400" : "text-white"
                            }`}
                          >
                            {getTitle(item)}
                          </motion.h3>
                          <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-400 text-sm"
                          >
                            {getYear(item)}
                          </motion.p>

                          {/* Rating stars */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-0.5 mt-2"
                          >
                            {renderStars(item.userRating, item.id)}
                          </motion.div>

                          {/* Comment */}
                          {isEditable ? (
                            <motion.textarea
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.6 }}
                              value={item.comment || ""}
                              onChange={(e) =>
                                onUpdateComment?.(item.id, e.target.value)
                              }
                              placeholder="Add your thoughts..."
                              className="mt-2 w-full p-2 text-sm bg-gray-900/50 rounded-lg border border-gray-600 resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-500"
                              rows={2}
                            />
                          ) : (
                            item.comment && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-2 text-gray-300 text-sm italic"
                              >
                                "{item.comment}"
                              </motion.p>
                            )
                          )}
                        </div>

                        {/* Winner crown/trophy */}
                        {isWinner && (
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: 0.5,
                              type: "spring",
                              stiffness: 200,
                            }}
                            className="absolute -top-3 -right-3 text-4xl"
                          >
                            <span role="img" aria-label="trophy">🏆</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="hidden"
                      onClick={() => {
                        if (!isAutoPlaying && nextToReveal === index) {
                          revealNext();
                        }
                      }}
                      disabled={isAutoPlaying || nextToReveal !== index}
                      whileHover={
                        !isAutoPlaying && nextToReveal === index
                          ? { scale: 1.02, y: -2 }
                          : {}
                      }
                      whileTap={
                        !isAutoPlaying && nextToReveal === index
                          ? { scale: 0.98 }
                          : {}
                      }
                      className={`w-full p-4 rounded-2xl border-2 transition-all ${
                        nextToReveal === index
                          ? "bg-gradient-to-r from-gray-800 to-gray-700 border-yellow-500/50 cursor-pointer hover:border-yellow-400"
                          : "bg-gray-900/50 border-gray-800 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-3xl ${
                            nextToReveal === index
                              ? "bg-gradient-to-br from-gray-600 to-gray-700 text-yellow-400"
                              : "bg-gray-800 text-gray-600"
                          }`}
                        >
                          {rank}
                        </div>
                        <div className="grow text-left">
                          <div
                            className={`text-xl font-bold tracking-wider ${
                              nextToReveal === index
                                ? "text-yellow-400"
                                : "text-gray-600"
                            }`}
                          >
                            ???
                          </div>
                          <div className="text-gray-500 text-sm">
                            {nextToReveal === index
                              ? "Click to reveal or use countdown"
                              : "Waiting..."}
                          </div>
                        </div>
                        {nextToReveal === index && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-yellow-400"
                          >
                            <SparklesIcon className="h-8 w-8" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 rounded-full border border-gray-700">
            <SparklesIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-400">
              {revealedIndices.size} / {totalItems} revealed
            </span>
          </div>
        </div>

        {/* Celebration message for winner */}
        <AnimatePresence>
          {celebrationItem && showConfetti && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-2xl shadow-yellow-500/30">
                <p className="text-black font-black text-2xl text-center">
                  And the #1 spot goes to...
                </p>
                <p className="text-black/80 font-bold text-xl text-center">
                  {getTitle(celebrationItem)}!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
