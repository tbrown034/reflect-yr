"use client";

/* global URLSearchParams */

// app/explore/page.jsx
// Explore page for browsing all media types without creating lists

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { searchByCategory } from "@/app/actions/search";
import { CATEGORIES } from "@/library/api/providers/types";
import {
  MagnifyingGlassIcon,
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

const LOG_PREFIX = "[ExplorePage]";
const CURRENT_YEAR = new Date().getFullYear();

// Category configurations with colors and icons
const CATEGORY_CONFIG = {
  all: {
    icon: MagnifyingGlassIcon,
    color: "slate",
    gradient: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-500",
    textColor: "text-slate-600 dark:text-slate-400",
    borderColor: "border-slate-500",
    name: "All",
  },
  movie: {
    icon: FilmIcon,
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500",
  },
  tv: {
    icon: TvIcon,
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500",
  },
  book: {
    icon: BookOpenIcon,
    color: "green",
    gradient: "from-green-500 to-green-600",
    bgColor: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-500",
  },
};

// Featured categories to show
const FEATURED_CATEGORIES = ["all", "movie", "tv", "book"];

function getImageUrl(item) {
  if (item.image) return item.image;
  if (item.poster_path) return `https://image.tmdb.org/t/p/w300${item.poster_path}`;
  return null;
}

// Loading fallback for Suspense
function ExplorePageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-6" />
      </main>
    </div>
  );
}

// Main explore content component
function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get("year") ? parseInt(searchParams.get("year")) : null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const categoryConfig = CATEGORY_CONFIG[activeCategory] || CATEGORY_CONFIG.movie;
  const categoryInfo = CATEGORIES[activeCategory];
  const CategoryIcon = categoryConfig.icon;

  // Update URL when filters change using Next.js router
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (searchQuery) params.set("q", searchQuery);
    if (selectedYear) params.set("year", selectedYear.toString());

    const newUrl = params.toString() ? `/explore?${params.toString()}` : "/explore";
    router.replace(newUrl, { scroll: false });
  }, [activeCategory, searchQuery, selectedYear, router]);

  // Search function
  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    console.log(`${LOG_PREFIX} Searching ${activeCategory} for: ${query}`);

    try {
      if (activeCategory === "all") {
        // Search all categories in parallel
        const categoriesToSearch = ["movie", "tv", "book"];
        const searchPromises = categoriesToSearch.map(async (cat) => {
          const { results } = await searchByCategory(query, cat, { limit: 8 });
          return (results || []).map((item) => ({ ...item, _category: cat }));
        });
        const allResults = await Promise.all(searchPromises);
        setSearchResults(allResults.flat());
      } else {
        const { results, error } = await searchByCategory(query, activeCategory, {
          limit: 20,
          year: categoryInfo?.hasYear ? selectedYear : undefined,
        });

        if (error) {
          console.error(`${LOG_PREFIX} Search error:`, error);
          setSearchResults([]);
          setSearchError("Search failed. Please try again.");
        } else {
          setSearchResults((results || []).map((item) => ({ ...item, _category: activeCategory })));
        }
      }
    } catch (err) {
      console.error(`${LOG_PREFIX} Search error:`, err);
      setSearchResults([]);
      setSearchError("An error occurred while searching. Please try again.");
    }

    setIsSearching(false);
  }, [activeCategory, selectedYear, categoryInfo]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Clear search and results when category changes
  useEffect(() => {
    setSearchResults([]);
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSelectedYear(null);
  };

  // Get detail page URL
  const getDetailUrl = (item) => {
    // Extract numeric ID from prefixed IDs like "tmdb_movie_438631"
    const extractId = (id) => {
      if (typeof id === "string" && id.includes("_")) {
        const parts = id.split("_");
        return parts[parts.length - 1];
      }
      return id;
    };

    const cleanId = extractId(item.id);
    const itemCategory = item._category || activeCategory;

    if (itemCategory === "movie") {
      return `/movies/${cleanId}`;
    }
    if (itemCategory === "tv") {
      return `/tv/${cleanId}`;
    }
    // For other categories, link to create with item pre-selected
    return `/create?category=${itemCategory}&item=${item.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Explore
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Search for movies, TV shows, and books
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {FEATURED_CATEGORIES.map((catId) => {
              const config = CATEGORY_CONFIG[catId];
              const info = CATEGORIES[catId];
              const Icon = config.icon;
              const isActive = activeCategory === catId;
              const displayName = config.name || info?.name || catId;

              return (
                <button
                  key={catId}
                  onClick={() => handleCategoryChange(catId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="relative grow">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeCategory === "all" ? "Search movies, TV, books..." : `Search ${categoryInfo?.name?.toLowerCase() || "items"}...`}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filters button - hide for "all" mode */}
            {activeCategory !== "all" && categoryInfo?.hasYear && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  showFilters || selectedYear
                    ? `${categoryConfig.borderColor} ${categoryConfig.textColor} bg-gray-50 dark:bg-gray-800`
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Filters</span>
                {selectedYear && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${categoryConfig.bgColor} text-white`}>
                    {selectedYear}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && activeCategory !== "all" && categoryInfo?.hasYear && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">Year</h3>
                    {selectedYear && (
                      <button
                        onClick={() => setSelectedYear(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(10)].map((_, i) => {
                      const year = CURRENT_YEAR - i;
                      return (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year === selectedYear ? null : year)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            year === selectedYear
                              ? `${categoryConfig.bgColor} text-white`
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        {isSearching ? (
          <div className="text-center py-12">
            <div className="animate-spin h-10 w-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Searching...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Found {searchResults.length} results for "{searchQuery}"
              {selectedYear && ` in ${selectedYear}`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.map((item, index) => {
                const imageUrl = getImageUrl(item);
                const itemCategory = item._category || activeCategory;
                const itemConfig = CATEGORY_CONFIG[itemCategory] || CATEGORY_CONFIG.movie;
                const itemCategoryInfo = CATEGORIES[itemCategory];
                const ItemIcon = itemConfig.icon;

                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={getDetailUrl(item)}
                      className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name || item.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ItemIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                          </div>
                        )}

                        {/* Category badge */}
                        <div className={`absolute top-2 right-2 ${itemConfig.bgColor} text-white text-xs px-2 py-1 rounded-full opacity-90`}>
                          {itemCategoryInfo?.name || itemCategory}
                        </div>

                        {/* Rating badge if available */}
                        {(item.vote_average != null || item.metadata?.rating != null) && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <StarIcon className="h-3 w-3 text-yellow-400" />
                            {(item.vote_average ?? item.metadata?.rating ?? 0).toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.name || item.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.year && <span>{item.year}</span>}
                          {item.subtitle && (
                            <span className="line-clamp-1">
                              {item.year ? " • " : ""}
                              {item.subtitle}
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : searchError ? (
          <div className="text-center py-16">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search Error
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchError}
            </p>
            <button
              onClick={() => {
                setSearchError(null);
                if (searchQuery) handleSearch(searchQuery);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : searchQuery ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try a different search term or change the filters
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className={`${categoryConfig.bgColor} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4`}>
              <CategoryIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {activeCategory === "all" ? "Search everything" : `Search ${categoryInfo?.name}`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try searching for something like:
            </p>

            {/* Quick suggestions */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {(activeCategory === "all" || activeCategory === "movie") && (
                <>
                  <button
                    onClick={() => setSearchQuery("Dune")}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Dune
                  </button>
                  <button
                    onClick={() => setSearchQuery("Pulp Fiction")}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Pulp Fiction
                  </button>
                </>
              )}
              {(activeCategory === "all" || activeCategory === "tv") && (
                <button
                  onClick={() => setSearchQuery("Breaking Bad")}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Breaking Bad
                </button>
              )}
              {(activeCategory === "all" || activeCategory === "book") && (
                <button
                  onClick={() => setSearchQuery("1984")}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  1984
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Default export wrapped in Suspense boundary for useSearchParams
export default function ExplorePage() {
  return (
    <Suspense fallback={<ExplorePageFallback />}>
      <ExploreContent />
    </Suspense>
  );
}
