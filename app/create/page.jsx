"use client";

import { use, useState, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListContext } from "@/library/contexts/ListContext";
import { searchMedia } from "@/app/actions/search";
import { ListThemeRenderer } from "@/components/ui/lists";
import ThemeSelector from "@/components/ui/ThemeSelector";
import LetterboxdImport from "@/components/ui/LetterboxdImport";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  PencilIcon,
  SparklesIcon,
  ShareIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  FilmIcon,
} from "@heroicons/react/24/solid";

const LOG_PREFIX = "[CreateListPage]";

// Current year for "Best of" default
const CURRENT_YEAR = new Date().getFullYear();

export default function CreateListPage() {
  const router = useRouter();

  const {
    watchedPool,
    movieList,
    createEnhancedList,
    importToWatchedPool,
    getWatchedPoolByYear,
    isInitialized,
    LIST_THEMES,
  } = use(ListContext);

  // Form state
  const [title, setTitle] = useState(`My Best Movies of ${CURRENT_YEAR}`);
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [theme, setTheme] = useState("classic");
  const [accentColor, setAccentColor] = useState("#3B82F6");
  const [selectedItems, setSelectedItems] = useState([]);

  // UI state
  const [showImport, setShowImport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("pool"); // pool, search

  console.log(`${LOG_PREFIX} Rendering create page, items: ${selectedItems.length}`);

  // Get movies from pool filtered by year
  const poolMovies = getWatchedPoolByYear("movie", year);

  // Search TMDB using Server Action
  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    console.log(`${LOG_PREFIX} Searching TMDB for: ${query}`);

    try {
      const { results, error } = await searchMedia(query, "movie", year);
      if (error) {
        console.error(`${LOG_PREFIX} Search error:`, error);
        setSearchResults([]);
      } else {
        setSearchResults(results || []);
      }
    } catch (err) {
      console.error(`${LOG_PREFIX} Search error:`, err);
      setSearchResults([]);
    }

    setIsSearching(false);
  }, [year]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Add item to list
  const addItem = useCallback((item) => {
    if (selectedItems.some((i) => i.id === item.id)) {
      console.log(`${LOG_PREFIX} Item already in list: ${item.id}`);
      return;
    }

    const newItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      release_date: item.release_date,
      vote_average: item.vote_average,
      year: item.year || (item.release_date ? parseInt(item.release_date.split("-")[0]) : null),
      userRating: item.rating || null,
      comment: "",
    };

    setSelectedItems((prev) => [...prev, newItem]);
    console.log(`${LOG_PREFIX} Added item: ${newItem.title}`);
  }, [selectedItems]);

  // Remove item from list
  const removeItem = useCallback((itemId) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  // Update item comment
  const updateItemComment = useCallback((itemId, comment) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, comment } : item
      )
    );
  }, []);

  // Update item rating
  const updateItemRating = useCallback((itemId, rating) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, userRating: rating } : item
      )
    );
  }, []);

  // Handle Letterboxd import
  const handleLetterboxdImport = useCallback((movies) => {
    console.log(`${LOG_PREFIX} Importing ${movies.length} movies from Letterboxd`);
    importToWatchedPool(movies, "movie");
    setShowImport(false);
  }, [importToWatchedPool]);

  // Create and publish list
  const handlePublish = useCallback(() => {
    if (selectedItems.length === 0) {
      alert("Please add some movies to your list first!");
      return;
    }

    console.log(`${LOG_PREFIX} Publishing list with ${selectedItems.length} items`);

    const listId = createEnhancedList({
      type: "movie",
      items: selectedItems,
      title,
      description,
      theme,
      accentColor,
      year,
      isPublic: true,
    });

    if (listId) {
      router.push(`/lists/movies/publish/${listId}`);
    }
  }, [selectedItems, title, description, theme, accentColor, year, createEnhancedList, router]);

  // Build preview list object
  const previewList = {
    title,
    description,
    theme,
    accentColor,
    year,
    items: selectedItems.map((item, index) => ({
      ...item,
      rank: index + 1,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/lists"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Your List
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <EyeIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Publish</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - List Builder */}
          <div className="space-y-6">
            {/* List Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PencilIcon className="h-5 w-5 text-blue-500" />
                List Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                    placeholder="My Best Movies of 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="A quick intro for your list..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={CURRENT_YEAR - i}>
                        {CURRENT_YEAR - i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Theme & Style</h2>
              <ThemeSelector
                selectedTheme={theme}
                selectedColor={accentColor}
                onThemeChange={setTheme}
                onColorChange={setAccentColor}
              />
            </div>

            {/* Selected Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Your List ({selectedItems.length})
                </h2>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FilmIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No movies added yet</p>
                  <p className="text-sm mt-1">
                    Add movies from your watched pool or search TMDB
                  </p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={selectedItems}
                  onReorder={setSelectedItems}
                  className="space-y-2"
                >
                  {selectedItems.map((item, index) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400 w-6">
                          {index + 1}
                        </span>

                        <div className="w-10 h-14 relative rounded overflow-hidden shrink-0">
                          {item.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                              alt={item.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 dark:bg-gray-600" />
                          )}
                        </div>

                        <div className="grow min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.year}</p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>

          {/* Right Column - Add Movies */}
          <div className="space-y-6">
            {/* Source Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab("pool")}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === "pool"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Your Watched ({poolMovies.length})
                </button>
                <button
                  onClick={() => setActiveTab("search")}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === "search"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  Search TMDB
                </button>
              </div>

              <div className="p-4">
                {activeTab === "pool" ? (
                  <>
                    {/* Import Button */}
                    <button
                      onClick={() => setShowImport(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <ArrowUpTrayIcon className="h-5 w-5" />
                      Import from Letterboxd
                    </button>

                    {/* Pool Movies */}
                    {poolMovies.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No movies in your pool for {year}</p>
                        <p className="text-sm mt-1">
                          Import from Letterboxd or search TMDB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {poolMovies.map((movie) => {
                          const isSelected = selectedItems.some((i) => i.id === movie.id);
                          return (
                            <button
                              key={movie.id}
                              onClick={() => !isSelected && addItem(movie)}
                              disabled={isSelected}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                isSelected
                                  ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              <div className="w-10 h-14 relative rounded overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-600">
                                {movie.poster_path && (
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                    alt={movie.title}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="grow text-left min-w-0">
                                <p className="font-medium truncate">{movie.title}</p>
                                <p className="text-xs text-gray-500">
                                  {movie.year}
                                  {movie.rating && ` • ${movie.rating}★`}
                                </p>
                              </div>
                              {isSelected ? (
                                <CheckIcon className="h-5 w-5 text-green-500" />
                              ) : (
                                <PlusIcon className="h-5 w-5 text-blue-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Search Input */}
                    <div className="relative mb-4">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a movie..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Search Results */}
                    {isSearching ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {searchResults.map((movie) => {
                          const isSelected = selectedItems.some((i) => i.id === movie.id);
                          return (
                            <button
                              key={movie.id}
                              onClick={() => !isSelected && addItem(movie)}
                              disabled={isSelected}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                isSelected
                                  ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              <div className="w-10 h-14 relative rounded overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-600">
                                {movie.poster_path && (
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                    alt={movie.title}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="grow text-left min-w-0">
                                <p className="font-medium truncate">{movie.title}</p>
                                <p className="text-xs text-gray-500">
                                  {movie.release_date?.split("-")[0]}
                                  {movie.vote_average && ` • ${movie.vote_average.toFixed(1)}`}
                                </p>
                              </div>
                              {isSelected ? (
                                <CheckIcon className="h-5 w-5 text-green-500" />
                              ) : (
                                <PlusIcon className="h-5 w-5 text-blue-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-8 text-gray-500">
                        No results found
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Start typing to search
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowPreview(false)}
          >
            <div className="min-h-screen py-8 px-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {selectedItems.length > 0 ? (
                  <ListThemeRenderer
                    list={previewList}
                    theme={theme}
                    accentColor={accentColor}
                    isEditable={true}
                    onUpdateComment={(itemId, comment) => updateItemComment(itemId, comment)}
                    onUpdateRating={(itemId, rating) => updateItemRating(itemId, rating)}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Add some movies to see the preview
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
