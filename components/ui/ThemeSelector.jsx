"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";
import { LIST_THEMES } from "@/library/contexts/ListContext";

const LOG_PREFIX = "[ThemeSelector]";

// Simple, clean theme preview icons
const themeIcons = {
  classic: (
    <div className="flex flex-col gap-2 h-full justify-center px-1">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: "currentColor" }}
          >
            {n}
          </span>
          <div className="h-1.5 rounded flex-1" style={{ backgroundColor: "currentColor", opacity: 0.4 }} />
        </div>
      ))}
    </div>
  ),
  "poster-grid": (
    <div className="grid grid-cols-3 gap-1 h-full content-center p-1.5">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className="aspect-[2/3] rounded-sm relative overflow-hidden"
          style={{ backgroundColor: "currentColor" }}
        >
          {/* Rank badge */}
          <div
            className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white/90 flex items-center justify-center"
          >
            <span className="text-[7px] font-bold" style={{ color: "currentColor" }}>{n}</span>
          </div>
        </div>
      ))}
    </div>
  ),
  "family-feud": (
    <div className="flex flex-col gap-1.5 h-full justify-center bg-blue-950 rounded-md p-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2 bg-blue-800 rounded px-2 py-1">
          <span className="text-[10px] font-bold text-yellow-400">{n}</span>
          <div className="h-2 bg-blue-200/50 rounded flex-1" />
        </div>
      ))}
    </div>
  ),
  podium: (
    <div className="flex items-end justify-center gap-1 h-full px-1 pb-1">
      {/* 2nd */}
      <div className="flex flex-col items-center">
        <div className="w-6 h-8 rounded-sm mb-0.5" style={{ backgroundColor: "currentColor", opacity: 0.6 }} />
        <div className="w-7 h-6 bg-gray-400 rounded-t flex items-start justify-center pt-0.5">
          <span className="text-[8px] font-bold text-white">2</span>
        </div>
      </div>
      {/* 1st */}
      <div className="flex flex-col items-center">
        <div className="w-7 h-10 rounded-sm mb-0.5 ring-1 ring-amber-400" style={{ backgroundColor: "currentColor", opacity: 0.8 }} />
        <div className="w-8 h-8 bg-amber-400 rounded-t flex items-start justify-center pt-0.5">
          <span className="text-[8px] font-bold text-white">1</span>
        </div>
      </div>
      {/* 3rd */}
      <div className="flex flex-col items-center">
        <div className="w-5 h-7 rounded-sm mb-0.5" style={{ backgroundColor: "currentColor", opacity: 0.5 }} />
        <div className="w-6 h-4 bg-amber-700 rounded-t flex items-start justify-center pt-0.5">
          <span className="text-[7px] font-bold text-white">3</span>
        </div>
      </div>
    </div>
  ),
  minimalist: (
    <div className="flex flex-col gap-2 h-full justify-center px-2 font-mono">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2 text-[10px]">
          <span style={{ color: "currentColor" }}>{String(n).padStart(2, "0")}.</span>
          <div className="h-1 rounded flex-1" style={{ backgroundColor: "currentColor", opacity: 0.3 }} />
        </div>
      ))}
    </div>
  ),
};

// Color presets
const colorPresets = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Gold", value: "#D4AF37" },
  { name: "Green", value: "#22C55E" },
  { name: "Teal", value: "#14B8A6" },
];

export default function ThemeSelector({
  selectedTheme = "classic",
  selectedColor = "#3B82F6",
  onThemeChange,
  onColorChange,
}) {
  console.log(
    `${LOG_PREFIX} Rendering with theme: ${selectedTheme}, color: ${selectedColor}`
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
          Choose a Theme
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {Object.entries(LIST_THEMES).map(([id, theme]) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onThemeChange?.(id)}
              className={`
                relative p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all
                ${
                  selectedTheme === id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
            >
              {/* Selected Check */}
              {selectedTheme === id && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
              )}

              {/* Theme Preview */}
              <div
                className="w-full aspect-square mb-1.5 sm:mb-2 p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gray-100 dark:bg-gray-800"
                style={{ color: selectedColor }}
              >
                {themeIcons[id]}
              </div>

              {/* Theme Name */}
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {theme.name}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 hidden sm:block">
                {theme.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
          Accent Color
        </h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {colorPresets.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange?.(color.value)}
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all
                ${
                  selectedColor === color.value
                    ? "ring-2 ring-offset-1 sm:ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110"
                    : "hover:scale-105"
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {selectedColor === color.value && (
                <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white mx-auto" />
              )}
            </button>
          ))}

          {/* Custom Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange?.(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              title="Custom color"
            >
              <span className="text-gray-400 text-xs">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
