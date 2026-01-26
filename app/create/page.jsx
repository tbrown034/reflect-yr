"use client";

import { use, useState, useCallback, useEffect, useRef, useMemo } from "react";
import Fuse from "fuse.js";
import { useRouter, useSearchParams } from "next/navigation";
import { ListContext } from "@/library/contexts/ListContext";
import { searchByCategory } from "@/app/actions/search";
import { ListThemeRenderer } from "@/components/ui/lists";
import ThemeSelector from "@/components/ui/ThemeSelector";
import LetterboxdImport from "@/components/ui/LetterboxdImport";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckIcon,
  FilmIcon,
  StarIcon,
  ShareIcon,
  BookmarkIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon, PencilIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const LOG_PREFIX = "[CreateListPage]";

// Map internal category types to URL-friendly plural forms
const CATEGORY_TO_URL = {
  movie: "movies",
  tv: "tv",
  book: "books",
  podcast: "podcasts",
  album: "albums",
  custom: "custom",
};

// Simple in-memory search cache (persists during session)
const searchCache = new Map();
const CACHE_MAX_SIZE = 50;
const RECENT_SEARCHES_KEY = "sortid_recent_searches";
const MAX_RECENT_SEARCHES = 10;

function getCacheKey(query, category) {
  return `${category}:${query.toLowerCase().trim()}`;
}

function getCachedResults(query, category) {
  const key = getCacheKey(query, category);
  return searchCache.get(key);
}

function setCachedResults(query, category, results) {
  const key = getCacheKey(query, category);
  // Simple LRU: delete oldest if at capacity
  if (searchCache.size >= CACHE_MAX_SIZE) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
  searchCache.set(key, results);
}

// Recent searches helpers
function getRecentSearches(category) {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "{}");
    return all[category] || [];
  } catch {
    return [];
  }
}

function addRecentSearch(query, category) {
  if (typeof window === "undefined" || !query || query.length < 2) return;
  try {
    const all = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "{}");
    const categorySearches = all[category] || [];
    // Remove if exists, add to front
    const filtered = categorySearches.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    all[category] = updated;
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(all));
  } catch {
    // Ignore localStorage errors
  }
}

// Fuse.js config for fuzzy matching
const fuseOptions = {
  keys: ["name", "title"],
  threshold: 0.4, // 0 = exact, 1 = match anything
  distance: 100,
  includeScore: true,
};

// Stage definitions: Type → Build → Style → Preview
const STAGES = [
  { id: "type", label: "Type", description: "Choose category" },
  { id: "build", label: "Build", description: "Add items" },
  { id: "style", label: "Style", description: "Theme & title" },
  { id: "preview", label: "Preview", description: "Save & share" },
];

// Category options for the Type stage
const CATEGORY_OPTIONS = [
  { id: "movie", name: "Movies", Icon: FilmIcon, description: "Films you've watched", color: "text-amber-500" },
  { id: "tv", name: "TV Shows", Icon: TvIcon, description: "Series you've binged", color: "text-blue-500" },
  { id: "book", name: "Books", Icon: BookOpenIcon, description: "Books you've read", color: "text-emerald-500" },
  { id: "podcast", name: "Podcasts", Icon: MicrophoneIcon, description: "Shows you listen to", color: "text-purple-500" },
  { id: "custom", name: "Custom", Icon: SparklesIcon, description: "Anything you want", color: "text-slate-500" },
];

function getItemImageUrl(item) {
  if (item.poster_path) return `https://image.tmdb.org/t/p/w200${item.poster_path}`;
  if (item.image) return item.image;
  return null;
}

function StageIndicator({ currentStage, onStageClick, canAdvance }) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center gap-2">
      {STAGES.map((stage, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = stage.id === currentStage;
        const isClickable = index <= currentIndex || (index === currentIndex + 1 && canAdvance);
        const stepNum = index + 1;

        return (
          <button
            key={stage.id}
            onClick={() => isClickable && onStageClick(stage.id)}
            disabled={!isClickable}
            className={`
              flex items-center gap-1.5 transition-all
              ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}
            `}
          >
            {/* Step number circle */}
            <span className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
              ${isCurrent
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : isComplete
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400"
              }
            `}>
              {isComplete ? <CheckIcon className="h-3.5 w-3.5" /> : stepNum}
            </span>
            {/* Label - hide on mobile for non-current */}
            <span className={`
              text-sm font-medium
              ${isCurrent ? "text-slate-900 dark:text-white" : "text-slate-400 hidden sm:inline"}
            `}>
              {stage.label}
            </span>
            {/* Connector line */}
            {index < STAGES.length - 1 && (
              <span className={`w-4 sm:w-8 h-0.5 ${isComplete ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function CreateListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category"); // null if not provided

  const {
    createEnhancedList,
    importToWatchedPool,
    CATEGORIES,
    hasReachedTotalListLimit,
    getRemainingListCount,
    ANONYMOUS_LIST_LIMIT,
    isLoggedIn,
  } = use(ListContext);

  // Stage state - start at "type" unless category is provided in URL
  const [stage, setStage] = useState(initialCategory ? "build" : "type");

  // Core state
  const [category, setCategory] = useState(initialCategory || "");
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Settings - simple defaults without year
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("classic");
  const [accentColor, setAccentColor] = useState("#3B82F6");

  // Modals
  const [showImport, setShowImport] = useState(false);

  // Editing state for inline notes
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Custom item input
  const [customItemName, setCustomItemName] = useState("");

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);

  // Get category name
  const categoryName = CATEGORIES[category]?.name || "Items";
  const isCustomCategory = category === "custom";

  // Default title based on category
  const defaultTitle = `My Top ${categoryName}`;

  // Reset items when category changes + load recent searches
  useEffect(() => {
    setSelectedItems([]);
    setSearchResults([]);
    setSearchQuery("");
    setTitle("");
    if (category) {
      setRecentSearches(getRecentSearches(category));
    }
  }, [category]);

  // Track current search to prevent stale results
  const searchIdRef = useRef(0);

  // Search with caching, fuzzy matching, and stale-request prevention
  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setShowSuggestions(false); // Hide suggestions when searching

    // Check cache first - use fuzzy match on cached results
    const cached = getCachedResults(query, category);
    if (cached) {
      // Apply fuzzy matching to cached results for typo tolerance
      const fuse = new Fuse(cached, fuseOptions);
      const fuzzyResults = fuse.search(query);
      // If fuzzy match found good results, use them; otherwise use original cache
      const finalResults = fuzzyResults.length > 0
        ? fuzzyResults.map(r => r.item)
        : cached;
      setSearchResults(finalResults);
      setIsSearching(false);
      return;
    }

    // Increment search ID to track this request
    const currentSearchId = ++searchIdRef.current;
    setIsSearching(true);

    try {
      const { results, error } = await searchByCategory(query, category, { limit: 20 });

      // Only update if this is still the current search (prevents stale results)
      if (currentSearchId === searchIdRef.current) {
        if (!error && results && results.length > 0) {
          // Apply fuzzy matching to re-rank results by relevance to query
          const fuse = new Fuse(results, fuseOptions);
          const fuzzyResults = fuse.search(query);
          const finalResults = fuzzyResults.length > 0
            ? fuzzyResults.map(r => r.item)
            : results;

          setSearchResults(finalResults.slice(0, 15));
          setCachedResults(query, category, results); // Cache original results

          // Save to recent searches if we got results
          addRecentSearch(query, category);
          setRecentSearches(getRecentSearches(category));
        } else if (!error) {
          setSearchResults([]);
        }
        setIsSearching(false);
      }
    } catch (err) {
      if (currentSearchId === searchIdRef.current) {
        console.error(`${LOG_PREFIX} Search error:`, err);
        setIsSearching(false);
      }
    }
  }, [category]);

  // Debounced search (200ms for snappier feel)
  useEffect(() => {
    // Show searching state immediately for feedback
    if (searchQuery && searchQuery.length >= 2) {
      const cached = getCachedResults(searchQuery, category);
      if (!cached) {
        setIsSearching(true);
      }
    }

    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch, category]);

  // Add item
  const addItem = useCallback((item) => {
    if (selectedItems.some((i) => i.id === item.id)) return;

    // Extract poster_path from various sources
    const posterPath = item.poster_path || item.metadata?.posterPath || null;

    const newItem = {
      id: item.id,
      externalId: item.externalId || item.id,
      category: item.category || category,
      provider: item.provider,
      name: item.name || item.title,
      title: item.title || item.name,
      image: item.image || (posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null),
      poster_path: posterPath,
      year: item.year || (item.release_date ? parseInt(item.release_date.split("-")[0]) : null),
      subtitle: item.subtitle,
      metadata: item.metadata || {},
      release_date: item.release_date,
      vote_average: item.vote_average || item.metadata?.voteAverage,
      userRating: null,
      comment: "",
    };
    setSelectedItems((prev) => [...prev, newItem]);
    setSearchQuery("");
    setSearchResults([]);
  }, [selectedItems, category]);

  const removeItem = useCallback((itemId) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  // Add custom item (for custom lists)
  const addCustomItem = useCallback((name) => {
    if (!name.trim()) return;
    const newItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: "custom",
      name: name.trim(),
      title: name.trim(),
      image: null,
      poster_path: null,
      year: null,
      userRating: null,
      comment: "",
    };
    setSelectedItems((prev) => [...prev, newItem]);
    setCustomItemName("");
  }, []);

  const updateItemComment = useCallback((itemId, comment) => {
    setSelectedItems((prev) =>
      prev.map((item) => item.id === itemId ? { ...item, comment } : item)
    );
  }, []);

  const updateItemRating = useCallback((itemId, rating) => {
    setSelectedItems((prev) =>
      prev.map((item) => item.id === itemId ? { ...item, userRating: rating } : item)
    );
  }, []);

  const handleLetterboxdImport = useCallback((movies) => {
    importToWatchedPool(movies, "movie");
    setShowImport(false);
  }, [importToWatchedPool]);

  const handleSave = useCallback(() => {
    if (selectedItems.length === 0) {
      alert(`Add some ${categoryName.toLowerCase()} first!`);
      return;
    }
    // Check list limit for anonymous users before attempting to create
    if (hasReachedTotalListLimit()) {
      alert(`You've reached the limit of ${ANONYMOUS_LIST_LIMIT} lists for anonymous users.\n\nSign in to save unlimited lists!`);
      return;
    }
    const listId = createEnhancedList({
      type: category,
      category,
      items: selectedItems,
      title: title || defaultTitle,
      description,
      theme,
      accentColor,
      isPublic: false,
    });
    if (listId) {
      router.push(`/lists`);
    }
  }, [selectedItems, title, defaultTitle, description, theme, accentColor, category, createEnhancedList, router, categoryName, hasReachedTotalListLimit, ANONYMOUS_LIST_LIMIT]);

  const handlePublish = useCallback(() => {
    if (selectedItems.length === 0) {
      alert(`Add some ${categoryName.toLowerCase()} first!`);
      return;
    }
    // Check list limit for anonymous users before attempting to create
    if (hasReachedTotalListLimit()) {
      alert(`You've reached the limit of ${ANONYMOUS_LIST_LIMIT} lists for anonymous users.\n\nSign in to save unlimited lists!`);
      return;
    }
    const listId = createEnhancedList({
      type: category,
      category,
      items: selectedItems,
      title: title || defaultTitle,
      description,
      theme,
      accentColor,
      isPublic: true,
    });
    if (listId) {
      // Go to My Lists - user can share from there
      router.push(`/lists`);
    }
  }, [selectedItems, title, defaultTitle, description, theme, accentColor, category, createEnhancedList, router, categoryName, hasReachedTotalListLimit, ANONYMOUS_LIST_LIMIT]);

  // List for preview
  const previewList = {
    title: title || defaultTitle,
    description,
    theme,
    accentColor,
    type: category,
    category,
    items: selectedItems.map((item, index) => ({ ...item, rank: index + 1 })),
  };

  const canAdvanceFromBuild = selectedItems.length > 0;
  const canAdvanceFromType = category !== "";

  // Navigation
  const nextStage = () => {
    if (stage === "type" && canAdvanceFromType) setStage("build");
    else if (stage === "build" && canAdvanceFromBuild) setStage("style");
    else if (stage === "style") setStage("preview");
  };

  const prevStage = () => {
    if (stage === "build") setStage("type");
    else if (stage === "style") setStage("build");
    else if (stage === "preview") setStage("style");
  };

  // Select category and advance
  const selectCategory = (categoryId) => {
    setCategory(categoryId);
    setStage("build");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          {/* Top row: Exit + Category label */}
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm"
            >
              <XMarkIcon className="h-5 w-5" />
              <span>Cancel</span>
            </Link>

            <h1 className="text-sm font-medium text-slate-900 dark:text-white">
              {category ? `New ${categoryName} List` : "New List"}
            </h1>

            <div className="w-16" /> {/* Spacer for balance */}
          </div>

          {/* Bottom row: Stage progress */}
          <div className="flex justify-center">
            <StageIndicator
              currentStage={stage}
              onStageClick={setStage}
              canAdvance={stage === "type" ? canAdvanceFromType : canAdvanceFromBuild}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* STAGE 1: TYPE */}
          {stage === "type" && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  What kind of list?
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Choose a category to get started
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORY_OPTIONS.map((cat) => {
                  const IconComponent = cat.Icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => selectCategory(cat.id)}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                        hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50
                        ${category === cat.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        }
                      `}
                    >
                      <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700 ${cat.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {cat.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STAGE 2: BUILD */}
          {stage === "build" && (
            <motion.div
              key="build"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Custom List Input */}
              {isCustomCategory ? (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomItem(customItemName)}
                      placeholder="Type anything and press Enter..."
                      className="flex-1 px-4 py-3 text-base border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => addCustomItem(customItemName)}
                      disabled={!customItemName.trim()}
                      className="px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Add anything: restaurants, places, goals, ideas...
                  </p>
                </div>
              ) : (
                <>
                  {/* Search with Autocomplete */}
                  <div className="mb-4 relative">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (e.target.value.length < 2) {
                            setShowSuggestions(true);
                          }
                        }}
                        onFocus={() => {
                          if (searchQuery.length < 2 && recentSearches.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay to allow click on suggestion
                          setTimeout(() => setShowSuggestions(false), 150);
                        }}
                        placeholder={`Search ${categoryName.toLowerCase()}...`}
                        className="w-full pl-10 pr-4 py-3 text-base border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                        autoComplete="off"
                      />
                    </div>

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && recentSearches.length > 0 && searchQuery.length < 2 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Recent Searches</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {recentSearches.map((term, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSearchQuery(term);
                                setShowSuggestions(false);
                                handleSearch(term);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <ClockIcon className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {category === "movie" && (
                      <button
                        onClick={() => setShowImport(true)}
                        className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4" />
                        Import from Letterboxd
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {(isSearching || searchResults.length > 0 || searchQuery.length >= 2) && (
                    <div className="mb-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg">
                      {isSearching && searchResults.length === 0 ? (
                        // Skeleton loaders while searching
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                              <div className="w-10 h-14 rounded bg-slate-200 dark:bg-slate-700" />
                              <div className="grow space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                              </div>
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
                            </div>
                          ))}
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                          {searchResults.map((item) => {
                            const isSelected = selectedItems.some((i) => i.id === item.id);
                            const imageUrl = getItemImageUrl(item);
                            return (
                              <button
                                key={item.id}
                                onClick={() => !isSelected && addItem(item)}
                                disabled={isSelected}
                                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                                  isSelected ? "opacity-40" : "hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                              >
                                <div className="w-10 h-14 relative rounded overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                                  {imageUrl && <Image src={imageUrl} alt="" fill sizes="40px" className="object-cover" />}
                                </div>
                                <div className="grow min-w-0">
                                  <p className="font-medium text-sm truncate">{item.name || item.title}</p>
                                  <p className="text-xs text-slate-500">{item.year}</p>
                                </div>
                                {isSelected ? (
                                  <CheckIcon className="h-5 w-5 text-emerald-500 shrink-0" />
                                ) : (
                                  <PlusIcon className="h-5 w-5 text-slate-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : searchQuery.length >= 2 && !isSearching ? (
                        // No results found
                        <div className="p-6 text-center text-slate-500">
                          <p className="text-sm">No results for "{searchQuery}"</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              )}

              {/* Your List */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Your List ({selectedItems.length})
                  </h2>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <FilmIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Search and add {categoryName.toLowerCase()}</p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={selectedItems}
                    onReorder={setSelectedItems}
                    className="divide-y divide-slate-100 dark:divide-slate-700"
                  >
                    {selectedItems.map((item, index) => {
                      const imageUrl = getItemImageUrl(item);
                      const isEditing = editingNoteId === item.id;

                      return (
                        <Reorder.Item
                          key={item.id}
                          value={item}
                          className="bg-white dark:bg-slate-800 cursor-grab active:cursor-grabbing"
                          whileDrag={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.12)", zIndex: 50 }}
                        >
                          <div className="p-3">
                            <div className="flex items-start gap-3">
                              {/* Rank */}
                              <span className="text-lg font-bold text-slate-300 dark:text-slate-600 w-5 text-center pt-1">
                                {index + 1}
                              </span>

                              {/* Poster */}
                              <div className="w-12 h-16 relative rounded overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                                {imageUrl && <Image src={imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                              </div>

                              {/* Content */}
                              <div className="grow min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{item.name || item.title}</p>
                                    <p className="text-xs text-slate-500">{item.year}</p>
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 shrink-0"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Star Rating */}
                                <div className="flex items-center gap-1 mt-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => updateItemRating(item.id, item.userRating === star ? null : star)}
                                      className="p-0.5"
                                    >
                                      {star <= (item.userRating || 0) ? (
                                        <StarIcon className="h-4 w-4 text-amber-400" />
                                      ) : (
                                        <StarOutlineIcon className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                      )}
                                    </button>
                                  ))}
                                </div>

                                {/* Note */}
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={item.comment || ""}
                                    onChange={(e) => updateItemComment(item.id, e.target.value)}
                                    onBlur={() => setEditingNoteId(null)}
                                    onKeyDown={(e) => e.key === "Enter" && setEditingNoteId(null)}
                                    placeholder="Add a note..."
                                    className="mt-2 w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                  />
                                ) : item.comment ? (
                                  <button
                                    onClick={() => setEditingNoteId(item.id)}
                                    className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic hover:text-slate-900 dark:hover:text-white text-left"
                                  >
                                    "{item.comment}"
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setEditingNoteId(item.id)}
                                    className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                  >
                                    <PencilIcon className="h-3 w-3" />
                                    Add note
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={prevStage}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={nextStage}
                  disabled={!canAdvanceFromBuild}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Style
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: STYLE */}
          {stage === "style" && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Title & Description */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  List Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={defaultTitle}
                  className="w-full text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />

                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 mt-4">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this list special?"
                  rows={2}
                  className="w-full text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-slate-600 dark:text-slate-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Theme Selection */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
                <ThemeSelector
                  selectedTheme={theme}
                  selectedColor={accentColor}
                  onThemeChange={setTheme}
                  onColorChange={setAccentColor}
                />
              </div>

              {/* Scaled Preview - uses actual theme renderer */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Preview</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>

                {/* Scaled down version of actual theme */}
                <div className="relative h-64 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 w-[200%] origin-top-left"
                    style={{ transform: "scale(0.5)" }}
                  >
                    <ListThemeRenderer
                      list={previewList}
                      theme={theme}
                      accentColor={accentColor}
                      isEditable={false}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={prevStage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={nextStage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  Finalize
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: PREVIEW */}
          {stage === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Full Preview */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-4">
                <ListThemeRenderer
                  list={previewList}
                  theme={theme}
                  accentColor={accentColor}
                  isEditable={false}
                />
              </div>

              {/* List Limit Warning for Anonymous Users */}
              {!isLoggedIn && getRemainingListCount() <= 3 && (
                <div className={`mb-4 p-3 rounded-lg flex items-start gap-3 ${
                  hasReachedTotalListLimit()
                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                }`}>
                  <ExclamationTriangleIcon className={`h-5 w-5 shrink-0 mt-0.5 ${
                    hasReachedTotalListLimit() ? "text-red-500" : "text-amber-500"
                  }`} />
                  <div className="text-sm">
                    {hasReachedTotalListLimit() ? (
                      <>
                        <p className="font-medium text-red-800 dark:text-red-200">List limit reached</p>
                        <p className="text-red-600 dark:text-red-300 mt-0.5">
                          You've used all {ANONYMOUS_LIST_LIMIT} lists.{" "}
                          <Link href="/profile" className="underline font-medium">Sign in</Link> for unlimited lists.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          {getRemainingListCount()} list{getRemainingListCount() === 1 ? "" : "s"} remaining
                        </p>
                        <p className="text-amber-600 dark:text-amber-300 mt-0.5">
                          <Link href="/profile" className="underline font-medium">Sign in</Link> for unlimited lists.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Save Options Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Save your list
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handlePublish}
                    disabled={hasReachedTotalListLimit()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <ShareIcon className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={hasReachedTotalListLimit()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <BookmarkIcon className="h-4 w-4" />
                    Save Draft
                  </button>
                </div>
              </div>

              {/* Navigation - consistent with other stages */}
              <div className="flex gap-3">
                <button
                  onClick={prevStage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Letterboxd Import Modal */}
      <AnimatePresence>
        {showImport && (
          <LetterboxdImport
            onImportComplete={handleLetterboxdImport}
            onClose={() => setShowImport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
