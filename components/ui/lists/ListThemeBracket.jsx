"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TrophyIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/solid";
import {
  getYear,
  getTitle,
  getImageUrl,
  getContrastColor,
  lightenColor,
} from "./themeUtils";

const LOG_PREFIX = "[ListThemeBracket]";

/**
 * Tournament Bracket theme - March Madness style elimination bracket
 * Supports 4, 6, 8, or 10 items with progressive rounds leading to a champion
 */
export default function ListThemeBracket({
  list,
  accentColor = "#3B82F6",
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [filledSlots, setFilledSlots] = useState(new Set());

  console.log(
    `${LOG_PREFIX} Rendering: ${list?.title} with ${list?.items?.length} items`
  );

  if (!list || !list.items || list.items.length === 0) {
    return <div className="text-gray-500">No list data</div>;
  }

  // Organize items into bracket structure based on count
  const bracketData = useMemo(() => {
    const items = list.items;
    const count = items.length;

    // Different bracket configurations based on item count
    // We work backwards from the winner (rank 1) to fill the bracket
    if (count <= 4) {
      // Simple Final Four: 2 semis -> 1 final
      return {
        type: "small",
        rounds: [
          {
            name: "Semifinals",
            matchups: [
              { left: items[2], right: items[3] }, // #3 vs #4
            ],
          },
          {
            name: "Finals",
            matchups: [{ left: items[1], right: items[0] }], // #2 loses to #1
          },
        ],
        champion: items[0],
      };
    } else if (count <= 6) {
      // 6 items: 2 first round, 2 semis, 1 final
      return {
        type: "medium",
        rounds: [
          {
            name: "First Round",
            matchups: [
              { left: items[4], right: items[5] }, // #5 vs #6
              { left: items[2], right: items[3] }, // #3 vs #4
            ],
          },
          {
            name: "Finals",
            matchups: [{ left: items[1], right: items[0] }],
          },
        ],
        champion: items[0],
      };
    } else if (count <= 8) {
      // 8 items: Elite Eight style
      return {
        type: "large",
        rounds: [
          {
            name: "Quarterfinals",
            matchups: [
              { left: items[6], right: items[7] }, // #7 vs #8
              { left: items[4], right: items[5] }, // #5 vs #6
            ],
          },
          {
            name: "Semifinals",
            matchups: [
              { left: items[2], right: items[3] }, // #3 vs #4
            ],
          },
          {
            name: "Finals",
            matchups: [{ left: items[1], right: items[0] }],
          },
        ],
        champion: items[0],
      };
    } else {
      // 10 items: Full bracket
      return {
        type: "full",
        rounds: [
          {
            name: "First Round",
            matchups: [
              { left: items[8], right: items[9] }, // #9 vs #10
              { left: items[6], right: items[7] }, // #7 vs #8
            ],
          },
          {
            name: "Quarterfinals",
            matchups: [
              { left: items[4], right: items[5] }, // #5 vs #6
            ],
          },
          {
            name: "Semifinals",
            matchups: [{ left: items[2], right: items[3] }],
          },
          {
            name: "Finals",
            matchups: [{ left: items[1], right: items[0] }],
          },
        ],
        champion: items[0],
      };
    }
  }, [list.items]);

  // Animation: progressively fill in bracket slots
  const fillSlot = (slotId) => {
    setFilledSlots((prev) => new Set([...prev, slotId]));
  };

  const fillAllSlots = () => {
    const allSlots = [];
    bracketData.rounds.forEach((round, ri) => {
      round.matchups.forEach((matchup, mi) => {
        allSlots.push(`${ri}-${mi}-left`);
        allSlots.push(`${ri}-${mi}-right`);
      });
    });
    allSlots.push("champion");
    setFilledSlots(new Set(allSlots));
  };

  const resetBracket = () => {
    setFilledSlots(new Set());
    setSelectedItem(null);
  };

  const isSlotFilled = (slotId) => filledSlots.has(slotId);

  const contrastColor = getContrastColor(accentColor);
  const lightAccent = lightenColor(accentColor, 30);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: accentColor }}
        >
          {list.title}
        </h1>
        {list.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto">
            {list.description}
          </p>
        )}
        {list.year && (
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            {list.year} Tournament
          </span>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={fillAllSlots}
            className="px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            Reveal Bracket
          </button>
          <button
            onClick={resetBracket}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Desktop Bracket View */}
      <div className="hidden md:block">
        <DesktopBracket
          bracketData={bracketData}
          accentColor={accentColor}
          contrastColor={contrastColor}
          lightAccent={lightAccent}
          isSlotFilled={isSlotFilled}
          fillSlot={fillSlot}
          setSelectedItem={setSelectedItem}
        />
      </div>

      {/* Mobile Bracket View */}
      <div className="md:hidden">
        <MobileBracket
          bracketData={bracketData}
          accentColor={accentColor}
          contrastColor={contrastColor}
          lightAccent={lightAccent}
          isSlotFilled={isSlotFilled}
          fillSlot={fillSlot}
          setSelectedItem={setSelectedItem}
        />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            accentColor={accentColor}
            onClose={() => setSelectedItem(null)}
            isEditable={isEditable}
            onUpdateComment={onUpdateComment}
            onUpdateRating={onUpdateRating}
          />
        )}
      </AnimatePresence>

      {/* Filled Count */}
      <div className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
        {filledSlots.size} / {list.items.length + 1} slots revealed
      </div>
    </div>
  );
}

/**
 * Desktop horizontal bracket layout
 */
function DesktopBracket({
  bracketData,
  accentColor,
  contrastColor,
  lightAccent,
  isSlotFilled,
  fillSlot,
  setSelectedItem,
}) {
  const totalRounds = bracketData.rounds.length;

  return (
    <div
      className="relative flex items-center justify-center gap-4 p-8 rounded-2xl overflow-x-auto"
      style={{
        background: `linear-gradient(135deg, ${accentColor}11, ${accentColor}05)`,
        minHeight: "500px",
      }}
    >
      {/* Left side rounds */}
      <div className="flex gap-4 items-center">
        {bracketData.rounds.slice(0, Math.ceil(totalRounds / 2)).map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col gap-8">
            <div
              className="text-xs font-semibold text-center mb-2 uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              {round.name}
            </div>
            {round.matchups.map((matchup, matchupIndex) => (
              <MatchupPair
                key={matchupIndex}
                matchup={matchup}
                roundIndex={roundIndex}
                matchupIndex={matchupIndex}
                accentColor={accentColor}
                contrastColor={contrastColor}
                lightAccent={lightAccent}
                isSlotFilled={isSlotFilled}
                fillSlot={fillSlot}
                setSelectedItem={setSelectedItem}
                direction="right"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Champion Center */}
      <div className="flex flex-col items-center mx-8">
        <div
          className="text-sm font-bold mb-4 uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          Champion
        </div>
        <ChampionSlot
          item={bracketData.champion}
          accentColor={accentColor}
          contrastColor={contrastColor}
          isSlotFilled={isSlotFilled}
          fillSlot={fillSlot}
          setSelectedItem={setSelectedItem}
        />
      </div>

      {/* Right side rounds (mirrored) */}
      <div className="flex gap-4 items-center flex-row-reverse">
        {bracketData.rounds.slice(Math.ceil(totalRounds / 2)).map((round, roundIndex) => (
          <div key={roundIndex + Math.ceil(totalRounds / 2)} className="flex flex-col gap-8">
            <div
              className="text-xs font-semibold text-center mb-2 uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              {round.name}
            </div>
            {round.matchups.map((matchup, matchupIndex) => (
              <MatchupPair
                key={matchupIndex}
                matchup={matchup}
                roundIndex={roundIndex + Math.ceil(totalRounds / 2)}
                matchupIndex={matchupIndex}
                accentColor={accentColor}
                contrastColor={contrastColor}
                lightAccent={lightAccent}
                isSlotFilled={isSlotFilled}
                fillSlot={fillSlot}
                setSelectedItem={setSelectedItem}
                direction="left"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mobile vertical bracket layout (tree style)
 */
function MobileBracket({
  bracketData,
  accentColor,
  contrastColor,
  lightAccent,
  isSlotFilled,
  fillSlot,
  setSelectedItem,
}) {
  return (
    <div
      className="p-4 rounded-2xl"
      style={{
        background: `linear-gradient(180deg, ${accentColor}11, ${accentColor}05)`,
      }}
    >
      {/* Champion at top */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="text-sm font-bold mb-3 uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          Champion
        </div>
        <ChampionSlot
          item={bracketData.champion}
          accentColor={accentColor}
          contrastColor={contrastColor}
          isSlotFilled={isSlotFilled}
          fillSlot={fillSlot}
          setSelectedItem={setSelectedItem}
        />

        {/* Connecting line down */}
        <div
          className="w-0.5 h-6 mt-2"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* Rounds from finals to first round */}
      {[...bracketData.rounds].reverse().map((round, roundIndex) => (
        <div key={roundIndex} className="mb-6">
          <div
            className="text-xs font-semibold text-center mb-3 uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            {round.name}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {round.matchups.map((matchup, matchupIndex) => (
              <div key={matchupIndex} className="flex flex-col items-center">
                {/* Connecting line up */}
                {roundIndex > 0 && (
                  <div
                    className="w-0.5 h-4 mb-2"
                    style={{ backgroundColor: accentColor }}
                  />
                )}

                <MobileMatchupPair
                  matchup={matchup}
                  roundIndex={bracketData.rounds.length - 1 - roundIndex}
                  matchupIndex={matchupIndex}
                  accentColor={accentColor}
                  contrastColor={contrastColor}
                  lightAccent={lightAccent}
                  isSlotFilled={isSlotFilled}
                  fillSlot={fillSlot}
                  setSelectedItem={setSelectedItem}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * A pair of bracket slots (matchup)
 */
function MatchupPair({
  matchup,
  roundIndex,
  matchupIndex,
  accentColor,
  contrastColor,
  lightAccent,
  isSlotFilled,
  fillSlot,
  setSelectedItem,
  direction = "right",
}) {
  const leftId = `${roundIndex}-${matchupIndex}-left`;
  const rightId = `${roundIndex}-${matchupIndex}-right`;

  return (
    <div className="flex flex-col items-center relative">
      {/* Top slot */}
      <BracketSlot
        item={matchup.left}
        slotId={leftId}
        accentColor={accentColor}
        contrastColor={contrastColor}
        lightAccent={lightAccent}
        isSlotFilled={isSlotFilled}
        fillSlot={fillSlot}
        setSelectedItem={setSelectedItem}
      />

      {/* Connecting bracket line */}
      <div className="relative h-8 w-full flex items-center justify-center">
        <svg
          className="absolute"
          width="120"
          height="32"
          viewBox="0 0 120 32"
          fill="none"
        >
          {/* Vertical line from top */}
          <line
            x1="60"
            y1="0"
            x2="60"
            y2="8"
            stroke={accentColor}
            strokeWidth="2"
          />
          {/* Horizontal connecting line */}
          <line
            x1="20"
            y1="8"
            x2="100"
            y2="8"
            stroke={accentColor}
            strokeWidth="2"
          />
          {/* Vertical line to bottom */}
          <line
            x1="60"
            y1="8"
            x2="60"
            y2="32"
            stroke={accentColor}
            strokeWidth="2"
          />
          {/* Line going out to next round */}
          {direction === "right" ? (
            <line
              x1="100"
              y1="8"
              x2="120"
              y2="8"
              stroke={accentColor}
              strokeWidth="2"
            />
          ) : (
            <line
              x1="0"
              y1="8"
              x2="20"
              y2="8"
              stroke={accentColor}
              strokeWidth="2"
            />
          )}
        </svg>
      </div>

      {/* Bottom slot */}
      <BracketSlot
        item={matchup.right}
        slotId={rightId}
        accentColor={accentColor}
        contrastColor={contrastColor}
        lightAccent={lightAccent}
        isSlotFilled={isSlotFilled}
        fillSlot={fillSlot}
        setSelectedItem={setSelectedItem}
      />
    </div>
  );
}

/**
 * Mobile matchup pair (side by side)
 */
function MobileMatchupPair({
  matchup,
  roundIndex,
  matchupIndex,
  accentColor,
  contrastColor,
  lightAccent,
  isSlotFilled,
  fillSlot,
  setSelectedItem,
}) {
  const leftId = `${roundIndex}-${matchupIndex}-left`;
  const rightId = `${roundIndex}-${matchupIndex}-right`;

  return (
    <div className="flex items-center gap-2">
      <BracketSlot
        item={matchup.left}
        slotId={leftId}
        accentColor={accentColor}
        contrastColor={contrastColor}
        lightAccent={lightAccent}
        isSlotFilled={isSlotFilled}
        fillSlot={fillSlot}
        setSelectedItem={setSelectedItem}
        size="small"
      />

      {/* VS indicator */}
      <div
        className="text-xs font-bold px-2 py-1 rounded"
        style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
      >
        vs
      </div>

      <BracketSlot
        item={matchup.right}
        slotId={rightId}
        accentColor={accentColor}
        contrastColor={contrastColor}
        lightAccent={lightAccent}
        isSlotFilled={isSlotFilled}
        fillSlot={fillSlot}
        setSelectedItem={setSelectedItem}
        size="small"
      />
    </div>
  );
}

/**
 * Individual bracket slot
 */
function BracketSlot({
  item,
  slotId,
  accentColor,
  contrastColor,
  lightAccent,
  isSlotFilled,
  fillSlot,
  setSelectedItem,
  size = "normal",
}) {
  const filled = isSlotFilled(slotId);
  const imageUrl = getImageUrl(item, size === "small" ? "small" : "medium");

  const slotStyles =
    size === "small"
      ? "w-20 h-28"
      : "w-28 h-40";

  return (
    <motion.button
      onClick={() => {
        if (!filled) {
          fillSlot(slotId);
        } else {
          setSelectedItem(item);
        }
      }}
      className={`${slotStyles} relative rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg`}
      style={{
        border: `2px solid ${accentColor}`,
        backgroundColor: filled ? "transparent" : `${accentColor}22`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {filled ? (
          <motion.div
            key="filled"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full relative"
          >
            {/* Poster */}
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={getTitle(item)}
                fill
                sizes={size === "small" ? "80px" : "112px"}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-xs text-center px-1">
                  {getTitle(item)}
                </span>
              </div>
            )}

            {/* Rank badge */}
            <div
              className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: accentColor, color: contrastColor }}
            >
              {item.rank || "?"}
            </div>

            {/* Title overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-1">
              <span className="text-white text-xs font-medium line-clamp-2">
                {getTitle(item)}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ color: accentColor }}
          >
            <span className="text-2xl font-bold">?</span>
            <span className="text-xs mt-1">#{item.rank || "?"}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * Champion slot with trophy
 */
function ChampionSlot({
  item,
  accentColor,
  contrastColor,
  isSlotFilled,
  fillSlot,
  setSelectedItem,
}) {
  const filled = isSlotFilled("champion");
  const imageUrl = getImageUrl(item, "large");

  return (
    <motion.button
      onClick={() => {
        if (!filled) {
          fillSlot("champion");
        } else {
          setSelectedItem(item);
        }
      }}
      className="w-36 h-52 md:w-44 md:h-64 relative rounded-xl overflow-hidden shadow-xl transition-all hover:shadow-2xl"
      style={{
        border: `4px solid ${accentColor}`,
        backgroundColor: filled ? "transparent" : `${accentColor}33`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {filled ? (
          <motion.div
            key="filled"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="w-full h-full relative"
          >
            {/* Poster */}
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={getTitle(item)}
                fill
                sizes="176px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-sm text-center px-2">
                  {getTitle(item)}
                </span>
              </div>
            )}

            {/* Trophy overlay */}
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 p-2 rounded-full shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              <TrophyIcon className="w-6 h-6 text-yellow-300" />
            </div>

            {/* Title bar at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 p-2"
              style={{ backgroundColor: `${accentColor}ee` }}
            >
              <h3
                className="font-bold text-sm text-center line-clamp-2"
                style={{ color: contrastColor }}
              >
                {getTitle(item)}
              </h3>
              <p
                className="text-xs text-center opacity-80"
                style={{ color: contrastColor }}
              >
                {getYear(item)}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ color: accentColor }}
          >
            <TrophyIcon className="w-12 h-12 opacity-50 mb-2" />
            <span className="text-lg font-bold">?</span>
            <span className="text-xs mt-1 opacity-70">Champion</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * Detail modal when clicking a revealed slot
 */
function ItemDetailModal({
  item,
  accentColor,
  onClose,
  isEditable,
  onUpdateComment,
  onUpdateRating,
}) {
  const imageUrl = getImageUrl(item, "xlarge");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className="relative h-48 sm:h-64">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={getTitle(item)}
              fill
              sizes="512px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Rank badge */}
          <div
            className="absolute bottom-3 left-3 px-3 py-1 rounded-full font-bold"
            style={{ backgroundColor: accentColor, color: "white" }}
          >
            #{item.rank || "?"}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {getTitle(item)}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {getYear(item)}
            {item.vote_average && (
              <span className="ml-2">TMDB: {item.vote_average.toFixed(1)}</span>
            )}
          </p>

          {/* User Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() =>
                  isEditable && onUpdateRating?.(item.id, star)
                }
                disabled={!isEditable}
                className={`transition-transform ${
                  isEditable ? "cursor-pointer hover:scale-110" : "cursor-default"
                }`}
              >
                <StarIcon
                  className={`w-6 h-6 ${
                    item.userRating && star <= item.userRating
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          {isEditable ? (
            <textarea
              value={item.comment || ""}
              onChange={(e) => onUpdateComment?.(item.id, e.target.value)}
              placeholder="Add your thoughts..."
              className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 resize-none focus:ring-2 focus:border-transparent"
              style={{ focusRing: accentColor }}
              rows={3}
            />
          ) : (
            item.comment && (
              <blockquote
                className="italic text-gray-600 dark:text-gray-300 border-l-4 pl-4"
                style={{ borderColor: accentColor }}
              >
                "{item.comment}"
              </blockquote>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
