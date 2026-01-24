"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FireIcon,
  SparklesIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";

const MODES = [
  { id: "roast", label: "Roast Me", icon: FireIcon, color: "from-orange-500 to-red-500" },
  { id: "analyze", label: "Analyze", icon: SparklesIcon, color: "from-blue-500 to-purple-500" },
  { id: "predict", label: "Predict", icon: LightBulbIcon, color: "from-green-500 to-emerald-500" },
  { id: "debate", label: "Debate", icon: ChatBubbleLeftRightIcon, color: "from-pink-500 to-rose-500" },
];

export default function RoastCard({ list }) {
  const [mode, setMode] = useState("roast");
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRoast = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list, mode }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      setRoast(data);
    } catch (err) {
      setError("Could not generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentMode = MODES.find((m) => m.id === mode);
  const ModeIcon = currentMode?.icon || FireIcon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentMode?.color || "from-orange-500 to-red-500"} p-4`}>
        <div className="flex items-center gap-2 text-white">
          <ModeIcon className="h-6 w-6" />
          <h3 className="font-bold text-lg">AI List Analysis</h3>
        </div>
      </div>

      {/* Mode selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setRoast(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  mode === m.id
                    ? `bg-gradient-to-r ${m.color} text-white`
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Analyzing your taste...
              </p>
            </motion.div>
          ) : roast ? (
            <motion.div
              key="roast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {roast.roast}
              </p>
              <button
                onClick={() => setRoast(null)}
                className="mt-4 text-sm text-blue-500 hover:text-blue-600"
              >
                Try again
              </button>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-red-500">{error}</p>
              <button
                onClick={generateRoast}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                Retry
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {mode === "roast" && "Ready to hear what AI thinks of your taste?"}
                {mode === "analyze" && "Get insights into your viewing patterns"}
                {mode === "predict" && "Discover what you might love next"}
                {mode === "debate" && "Challenge your #1 pick"}
              </p>
              <button
                onClick={generateRoast}
                disabled={!list?.items?.length}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all bg-gradient-to-r ${currentMode?.color} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {mode === "roast" ? "Roast My List" : `Generate ${currentMode?.label}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
