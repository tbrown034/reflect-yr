"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  StarIcon,
  FireIcon,
  ClockIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

// Calculate interesting stats from a list
function calculateStats(items) {
  if (!items || items.length === 0) return null;

  const totalItems = items.length;

  // Average rating (if user ratings exist)
  const itemsWithRatings = items.filter((i) => i.userRating);
  const avgUserRating =
    itemsWithRatings.length > 0
      ? itemsWithRatings.reduce((sum, i) => sum + i.userRating, 0) /
        itemsWithRatings.length
      : null;

  // TMDB/consensus ratings
  const itemsWithConsensus = items.filter(
    (i) => i.vote_average || i.metadata?.score
  );
  const avgConsensus =
    itemsWithConsensus.length > 0
      ? itemsWithConsensus.reduce(
          (sum, i) => sum + (i.vote_average || i.metadata?.score || 0),
          0
        ) / itemsWithConsensus.length
      : null;

  // Year distribution
  const years = items
    .map((i) => {
      if (i.release_date) return new Date(i.release_date).getFullYear();
      if (i.first_air_date) return new Date(i.first_air_date).getFullYear();
      return i.year;
    })
    .filter(Boolean);

  const avgYear =
    years.length > 0
      ? Math.round(years.reduce((a, b) => a + b, 0) / years.length)
      : null;

  const newestYear = years.length > 0 ? Math.max(...years) : null;
  const oldestYear = years.length > 0 ? Math.min(...years) : null;

  // Hot takes count
  const hotTakes = items.filter((i) => {
    const userScaled = (i.userRating || 0) * 2;
    const consensus = i.vote_average || i.metadata?.score || 0;
    return i.userRating && consensus && Math.abs(userScaled - consensus) >= 3;
  }).length;

  // Genre distribution (if available from metadata)
  const genres = {};
  items.forEach((item) => {
    const itemGenres =
      item.metadata?.genres || item.genre_ids || item.genres || [];
    itemGenres.forEach((g) => {
      const name = typeof g === "string" ? g : g.name || g.id;
      if (name) genres[name] = (genres[name] || 0) + 1;
    });
  });

  const topGenres = Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // Decade breakdown
  const decades = {};
  years.forEach((y) => {
    const decade = `${Math.floor(y / 10) * 10}s`;
    decades[decade] = (decades[decade] || 0) + 1;
  });

  const topDecade =
    Object.entries(decades).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalItems,
    avgUserRating: avgUserRating ? avgUserRating.toFixed(1) : null,
    avgConsensus: avgConsensus ? avgConsensus.toFixed(1) : null,
    avgYear,
    newestYear,
    oldestYear,
    hotTakes,
    topGenres,
    topDecade,
    yearSpan: newestYear && oldestYear ? newestYear - oldestYear : null,
  };
}

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center gap-3"
  >
    <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </motion.div>
);

export default function TasteStats({ items, title = "Your Taste Profile" }) {
  const stats = useMemo(() => calculateStats(items), [items]);

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="flex items-center gap-2 text-white">
          <ChartBarIcon className="h-6 w-6" />
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          icon={HeartIcon}
          label="Items Ranked"
          value={stats.totalItems}
          color="from-pink-500 to-rose-500"
          delay={0}
        />

        {stats.avgUserRating && (
          <StatCard
            icon={StarIcon}
            label="Avg Rating"
            value={`${stats.avgUserRating}/5`}
            color="from-yellow-500 to-amber-500"
            delay={0.05}
          />
        )}

        {stats.hotTakes > 0 && (
          <StatCard
            icon={FireIcon}
            label="Hot Takes"
            value={stats.hotTakes}
            color="from-orange-500 to-red-500"
            delay={0.1}
          />
        )}

        {stats.topDecade && (
          <StatCard
            icon={ClockIcon}
            label="Top Decade"
            value={stats.topDecade}
            color="from-blue-500 to-cyan-500"
            delay={0.15}
          />
        )}

        {stats.avgConsensus && (
          <StatCard
            icon={SparklesIcon}
            label="Avg TMDB"
            value={stats.avgConsensus}
            color="from-green-500 to-emerald-500"
            delay={0.2}
          />
        )}

        {stats.yearSpan > 0 && (
          <StatCard
            icon={ChartBarIcon}
            label="Year Span"
            value={`${stats.yearSpan} yrs`}
            color="from-purple-500 to-violet-500"
            delay={0.25}
          />
        )}
      </div>

      {/* Genres */}
      {stats.topGenres.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Top Genres
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.topGenres.map((genre, i) => (
              <motion.span
                key={genre}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
              >
                {genre}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Footer insight */}
      <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {stats.avgYear && (
            <>
              Your picks average from <strong>{stats.avgYear}</strong>.{" "}
            </>
          )}
          {stats.hotTakes > 0 && (
            <>
              You have <strong>{stats.hotTakes} hot take{stats.hotTakes > 1 ? "s" : ""}</strong> where
              your opinion differs from critics!
            </>
          )}
          {stats.hotTakes === 0 && stats.avgUserRating && (
            <>
              You tend to agree with the crowd - your ratings closely match the consensus.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
