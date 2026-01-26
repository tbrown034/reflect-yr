"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";
import { LIST_THEMES } from "@/library/contexts/ListContext";

const LOG_PREFIX = "[ThemeSelector]";

// Preview icons for each theme
const themeIcons = {
  classic: (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-current" />
        <div className="h-2 bg-current/60 rounded grow" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-current/70" />
        <div className="h-2 bg-current/40 rounded grow" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-current/50" />
        <div className="h-2 bg-current/30 rounded grow" />
      </div>
    </div>
  ),
  "poster-grid": (
    <div className="grid grid-cols-3 gap-0.5">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-2/3 bg-current rounded-sm"
          style={{ opacity: 1 - i * 0.1 }}
        />
      ))}
    </div>
  ),
  "family-feud": (
    <div className="flex flex-col gap-1">
      <div className="h-3 bg-current rounded" />
      <div className="h-3 bg-current/70 rounded" />
      <div className="h-3 bg-current/40 rounded flex items-center justify-center">
        <span className="text-[6px] text-white">???</span>
      </div>
    </div>
  ),
  podium: (
    <div className="flex items-end justify-center gap-0.5 h-full pt-2">
      <div className="w-3 h-5 bg-current/60 rounded-t-sm" />
      <div className="w-3 h-7 bg-current rounded-t-sm" />
      <div className="w-3 h-4 bg-current/40 rounded-t-sm" />
    </div>
  ),
  minimalist: (
    <div className="flex flex-col gap-1 font-serif text-[8px]">
      <div className="flex items-baseline gap-1">
        <span className="opacity-50">01</span>
        <span className="bg-current/60 h-1.5 grow rounded" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="opacity-50">02</span>
        <span className="bg-current/40 h-1.5 grow rounded" />
      </div>
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
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Choose a Theme
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(LIST_THEMES).map(([id, theme]) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onThemeChange?.(id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${
                  selectedTheme === id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
            >
              {/* Selected Check */}
              {selectedTheme === id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Theme Preview */}
              <div
                className="w-full aspect-square mb-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                style={{ color: selectedColor }}
              >
                {themeIcons[id]}
              </div>

              {/* Theme Name */}
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {theme.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {theme.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Accent Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {colorPresets.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange?.(color.value)}
              className={`
                w-10 h-10 rounded-full transition-all
                ${
                  selectedColor === color.value
                    ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110"
                    : "hover:scale-105"
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {selectedColor === color.value && (
                <CheckIcon className="h-5 w-5 text-white mx-auto" />
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
              className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
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
