"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  getYear,
  getTitle,
  getImageUrl,
  hasImage,
} from "./themeUtils";

const LOG_PREFIX = "[ListThemeVHS]";

// VHS color palette - retro 80s aesthetic
const VHS_COLORS = {
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  yellow: "#FFFF00",
  electricBlue: "#0066FF",
  neonPink: "#FF6EC7",
  neonGreen: "#39FF14",
};

// Map accent colors to VHS palette
function getVHSColor(accentColor) {
  // If it's already a VHS color, use it
  const vhsValues = Object.values(VHS_COLORS);
  if (vhsValues.includes(accentColor?.toUpperCase())) {
    return accentColor;
  }
  // Default to cyan for that classic VHS look
  return VHS_COLORS.cyan;
}

/**
 * VHS Test Pattern Placeholder - when no image available
 */
function VHSTestPattern() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Color bars */}
      <div className="flex-1 flex">
        <div className="flex-1 bg-[#FFFFFF]" />
        <div className="flex-1 bg-[#FFFF00]" />
        <div className="flex-1 bg-[#00FFFF]" />
        <div className="flex-1 bg-[#00FF00]" />
        <div className="flex-1 bg-[#FF00FF]" />
        <div className="flex-1 bg-[#FF0000]" />
        <div className="flex-1 bg-[#0000FF]" />
      </div>
      {/* Static noise bar */}
      <div className="h-4 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 animate-pulse" />
      <div className="flex-1 flex items-center justify-center bg-black">
        <span className="font-mono text-xs text-cyan-400 tracking-widest">NO SIGNAL</span>
      </div>
    </div>
  );
}

/**
 * Scan lines overlay effect
 */
function ScanLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 opacity-30"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)",
      }}
    />
  );
}

/**
 * Static noise overlay
 */
function StaticNoise() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-20 opacity-5 mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/**
 * VHS Tape component - individual cassette case
 */
function VHSTape({
  item,
  index,
  vhsColor,
  isEditable,
  onUpdateComment,
  onUpdateRating,
}) {
  const title = getTitle(item);
  const year = getYear(item);
  const imageUrl = getImageUrl(item, "medium");
  const hasImageAvailable = hasImage(item);

  // Format rating as text
  const ratingText = item.userRating
    ? `${item.userRating} out of 5 stars`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className="relative group"
    >
      {/* VHS Tape Case */}
      <div className="relative flex bg-gray-900 rounded-sm shadow-2xl overflow-hidden border border-gray-700 h-48 md:h-56">
        {/* Side Spine - vertical title area */}
        <div
          className="w-8 md:w-10 shrink-0 flex flex-col items-center justify-between py-2 relative"
          style={{ backgroundColor: vhsColor }}
        >
          {/* Rank number at top */}
          <span className="font-mono font-black text-black text-lg md:text-xl">
            {item.rank || index + 1}
          </span>

          {/* Vertical title */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <span className="font-mono font-bold text-black text-xs md:text-sm tracking-wider truncate max-h-32 text-center px-1">
              {title.toUpperCase()}
            </span>
          </div>

          {/* Year at bottom */}
          {year && (
            <span className="font-mono text-black text-xs font-bold">{year}</span>
          )}
        </div>

        {/* Main tape area */}
        <div className="flex-1 relative bg-black">
          {/* Cover art area */}
          <div className="absolute inset-2 overflow-hidden rounded-sm">
            {hasImageAvailable ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 40vw, 200px"
                className="object-cover"
              />
            ) : (
              <VHSTestPattern />
            )}

            {/* Scan lines on cover */}
            <ScanLines />
            <StaticNoise />
          </div>

          {/* Play button indicator */}
          <motion.div
            className="absolute bottom-3 right-3 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ backgroundColor: vhsColor }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-black ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>

          {/* VCR tracking lines animation on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
            initial={false}
          >
            <motion.div
              className="absolute left-0 right-0 h-1 bg-white/20"
              animate={{
                top: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Rating and comment section (below tape) */}
      <div className="mt-2 px-1">
        {/* Rating display */}
        {(item.userRating || isEditable) && (
          <div className="flex items-center gap-2 mb-1">
            {isEditable ? (
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onUpdateRating?.(item.id, star)}
                    className="font-mono text-lg hover:scale-125 transition-transform"
                    style={{
                      color:
                        item.userRating && star <= item.userRating
                          ? vhsColor
                          : "#4B5563",
                    }}
                  >
                    *
                  </button>
                ))}
              </div>
            ) : (
              ratingText && (
                <span
                  className="font-mono text-xs tracking-wide"
                  style={{ color: vhsColor }}
                >
                  [{ratingText.toUpperCase()}]
                </span>
              )
            )}
          </div>
        )}

        {/* Comment */}
        {isEditable ? (
          <textarea
            value={item.comment || ""}
            onChange={(e) => onUpdateComment?.(item.id, e.target.value)}
            placeholder="Add review..."
            className="w-full p-2 text-xs font-mono bg-gray-900 border border-gray-700 rounded text-cyan-400 placeholder:text-gray-600 resize-none focus:outline-none focus:border-cyan-400"
            rows={2}
          />
        ) : (
          item.comment && (
            <p
              className="font-mono text-xs line-clamp-2"
              style={{ color: vhsColor }}
            >
              &gt; {item.comment}
            </p>
          )
        )}
      </div>
    </motion.div>
  );
}

/**
 * VHS Theme - 80s video rental store aesthetic
 * Think Blockbuster shelves circa 1988
 */
export default function ListThemeVHS({
  list,
  accentColor = "#00FFFF",
  isEditable = false,
  onUpdateComment,
  onUpdateRating,
}) {
  console.log(
    `${LOG_PREFIX} Rendering list: ${list?.title} with ${list?.items?.length} items`
  );

  if (!list || !list.items) {
    return (
      <div className="font-mono text-cyan-400 text-center py-8">
        [NO TAPE LOADED]
      </div>
    );
  }

  const vhsColor = getVHSColor(accentColor);

  return (
    <div className="relative bg-gray-950 min-h-screen p-4 md:p-8 overflow-hidden">
      {/* Global scan lines */}
      <ScanLines />
      <StaticNoise />

      {/* "Be Kind Rewind" Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-30 text-center mb-8 md:mb-12"
      >
        {/* Decorative top border */}
        <div
          className="h-1 w-48 mx-auto mb-4 rounded"
          style={{
            background: `linear-gradient(90deg, transparent, ${vhsColor}, transparent)`,
          }}
        />

        {/* Be Kind Rewind banner */}
        <motion.div
          className="inline-block px-6 py-2 mb-4 border-2 rounded"
          style={{ borderColor: vhsColor }}
          animate={{
            boxShadow: [
              `0 0 10px ${vhsColor}40`,
              `0 0 20px ${vhsColor}60`,
              `0 0 10px ${vhsColor}40`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span
            className="font-mono font-bold tracking-[0.3em] text-sm md:text-base"
            style={{ color: vhsColor }}
          >
            BE KIND REWIND
          </span>
        </motion.div>

        {/* List title */}
        <h1
          className="font-mono font-black text-2xl md:text-4xl tracking-wider mb-2"
          style={{
            color: vhsColor,
            textShadow: `0 0 10px ${vhsColor}80, 0 0 20px ${vhsColor}40`,
          }}
        >
          {list.title?.toUpperCase() || "MY COLLECTION"}
        </h1>

        {/* Description */}
        {list.description && (
          <p className="font-mono text-gray-400 text-sm max-w-xl mx-auto mt-2">
            {list.description}
          </p>
        )}

        {/* Year badge */}
        {list.year && (
          <div
            className="inline-block mt-4 px-4 py-1 font-mono font-bold text-black rounded-sm"
            style={{ backgroundColor: vhsColor }}
          >
            {list.year}
          </div>
        )}

        {/* VCR display */}
        <div className="flex items-center justify-center gap-4 mt-4 font-mono text-xs text-gray-500">
          <span className="animate-pulse">[REC]</span>
          <span>PLAY {String.fromCharCode(9654)}</span>
          <span>SP MODE</span>
        </div>
      </motion.div>

      {/* Video rental shelf - tape grid */}
      <div className="relative z-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {list.items.map((item, index) => (
          <VHSTape
            key={item.id}
            item={item}
            index={index}
            vhsColor={vhsColor}
            isEditable={isEditable}
            onUpdateComment={onUpdateComment}
            onUpdateRating={onUpdateRating}
          />
        ))}
      </div>

      {/* Bottom shelf decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-30 mt-12 text-center"
      >
        <div
          className="h-px w-full max-w-2xl mx-auto mb-4"
          style={{
            background: `linear-gradient(90deg, transparent, ${vhsColor}60, transparent)`,
          }}
        />
        <p className="font-mono text-xs text-gray-600 tracking-widest">
          {list.items.length} TAPE{list.items.length !== 1 ? "S" : ""} IN
          COLLECTION
        </p>
        <p className="font-mono text-xs text-gray-700 mt-1">
          BLOCKBUSTER VIDEO - WHERE MOVIE LOVERS GO
        </p>
      </motion.div>

      {/* Decorative corner elements */}
      <div
        className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 opacity-30"
        style={{ borderColor: vhsColor }}
      />
      <div
        className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 opacity-30"
        style={{ borderColor: vhsColor }}
      />
      <div
        className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 opacity-30"
        style={{ borderColor: vhsColor }}
      />
      <div
        className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 opacity-30"
        style={{ borderColor: vhsColor }}
      />
    </div>
  );
}
