"use client";

import { use, useState, useCallback, useEffect } from "react";
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
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

const LOG_PREFIX = "[CreateListPage]";
const CURRENT_YEAR = new Date().getFullYear();

// Stage definitions
const STAGES = [
  { id: "build", label: "Build", description: "Add items" },
  { id: "finalize", label: "Finalize", description: "Rate & comment" },
  { id: "customize", label: "Customize", description: "Theme & publish" },
];

function getItemImageUrl(item) {
  if (item.poster_path) return `https://image.tmdb.org/t/p/w200${item.poster_path}`;
  if (item.image) return item.image;
  return null;
}

function StageIndicator({ currentStage, onStageClick, canAdvance }) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center justify-center gap-2">
      {STAGES.map((stage, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = stage.id === currentStage;
        const isClickable = index <= currentIndex || (index === currentIndex + 1 && canAdvance);

        return (
          <button
            key={stage.id}
            onClick={() => isClickable && onStageClick(stage.id)}
            disabled={!isClickable}
            className={`
              flex items-center gap-2 px-3 py-1.5 text-sm transition-all
              ${isCurrent
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium"
                : isComplete
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }
              ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"}
            `}
          >
            {isComplete && <CheckIcon className="h-3.5 w-3.5" />}
            <span>{stage.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function CreateListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "movie";

  const {
    createEnhancedList,
    importToWatchedPool,
    CATEGORIES,
  } = use(ListContext);

  // Stage state
  const [stage, setStage] = useState("build");

  // Core state
  const [category, setCategory] = useState(initialCategory);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Settings
  const [title, setTitle] = useState(`My Best Movies of ${CURRENT_YEAR}`);
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [theme, setTheme] = useState("classic");
  const [accentColor, setAccentColor] = useState("#3B82F6");

  // Modals
  const [showImport, setShowImport] = useState(false);

  // Update title when category changes
  useEffect(() => {
    const categoryName = CATEGORIES[category]?.name || "Items";
    setTitle(`My Best ${categoryName} of ${CURRENT_YEAR}`);
    setSelectedItems([]);
    setSearchResults([]);
    setSearchQuery("");
  }, [category, CATEGORIES]);

  // Search
  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { results, error } = await searchByCategory(query, category, { limit: 15 });
      if (!error) setSearchResults(results || []);
    } catch (err) {
      console.error(`${LOG_PREFIX} Search error:`, err);
    }
    setIsSearching(false);
  }, [category]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Add item (simple - no rating/comment)
  const addItem = useCallback((item) => {
    if (selectedItems.some((i) => i.id === item.id)) return;
    const newItem = {
      id: item.id,
      externalId: item.externalId || item.id,
      category: item.category || category,
      provider: item.provider,
      name: item.name || item.title,
      title: item.title || item.name,
      image: item.image || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null),
      poster_path: item.poster_path,
      year: item.year || (item.release_date ? parseInt(item.release_date.split("-")[0]) : null),
      subtitle: item.subtitle,
      metadata: item.metadata || {},
      release_date: item.release_date,
      vote_average: item.vote_average,
      userRating: null,
      comment: "",
    };
    setSelectedItems((prev) => [...prev, newItem]);
  }, [selectedItems, category]);

  const removeItem = useCallback((itemId) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== itemId));
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

  const handlePublish = useCallback(() => {
    if (selectedItems.length === 0) {
      alert(`Add some ${CATEGORIES[category]?.name?.toLowerCase() || "items"} first!`);
      return;
    }
    const listId = createEnhancedList({
      type: category,
      category,
      items: selectedItems,
      title,
      description,
      theme,
      accentColor,
      year,
      isPublic: true,
    });
    if (listId) {
      const urlType = category === "movie" ? "movies" : category;
      router.push(`/lists/${urlType}/publish/${listId}`);
    }
  }, [selectedItems, title, description, theme, accentColor, year, category, createEnhancedList, router, CATEGORIES]);

  // Preview list for theme renderer (no title/description - we show them separately)
  const previewList = {
    title: "",
    description: "",
    theme,
    accentColor,
    year,
    type: category,
    category,
    items: selectedItems.map((item, index) => ({ ...item, rank: index + 1 })),
  };

  // Full list for publishing
  const fullList = {
    title,
    description,
    theme,
    accentColor,
    year,
    type: category,
    category,
    items: selectedItems.map((item, index) => ({ ...item, rank: index + 1 })),
  };

  const categoryName = CATEGORIES[category]?.name || "Items";
  const canAdvanceFromBuild = selectedItems.length > 0;

  const nextStage = () => {
    if (stage === "build" && canAdvanceFromBuild) setStage("finalize");
    else if (stage === "finalize") setStage("customize");
  };

  const prevStage = () => {
    if (stage === "finalize") setStage("build");
    else if (stage === "customize") setStage("finalize");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="text-sm">Back</span>
            </Link>

            {/* Stage Indicator */}
            <StageIndicator
              currentStage={stage}
              onStageClick={setStage}
              canAdvance={canAdvanceFromBuild}
            />

            {/* Category Pills (only in build stage) */}
            {stage === "build" && (
              <div className="flex border border-slate-300 dark:border-slate-600">
                {["movie", "tv", "book", "podcast"].map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      i > 0 ? "border-l border-slate-300 dark:border-slate-600" : ""
                    } ${
                      category === cat
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {CATEGORIES[cat]?.name || cat}
                  </button>
                ))}
              </div>
            )}

            {stage !== "build" && <div className="w-32" />}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* STAGE 1: BUILD */}
        {stage === "build" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${categoryName.toLowerCase()}...`}
                  className="w-full pl-12 pr-4 py-3 text-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  autoFocus
                />
              </div>

              {category === "movie" && (
                <button
                  onClick={() => setShowImport(true)}
                  className="mt-3 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Import from Letterboxd
                </button>
              )}
            </div>

            {/* Search Results */}
            {(isSearching || searchResults.length > 0 || searchQuery) && (
              <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 overflow-hidden">
                {isSearching ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-slate-500 border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
                    {searchResults.map((item) => {
                      const isSelected = selectedItems.some((i) => i.id === item.id);
                      const imageUrl = getItemImageUrl(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => !isSelected && addItem(item)}
                          disabled={isSelected}
                          className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                            isSelected ? "opacity-50 bg-slate-50 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="w-10 h-14 relative overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                            {imageUrl && <Image src={imageUrl} alt={item.name || item.title} fill sizes="40px" className="object-cover" />}
                          </div>
                          <div className="grow min-w-0">
                            <p className="font-medium truncate">{item.name || item.title}</p>
                            <p className="text-xs text-slate-500">{item.year}{item.subtitle && ` • ${item.subtitle}`}</p>
                          </div>
                          {isSelected ? (
                            <CheckIcon className="h-5 w-5 text-emerald-600 shrink-0" />
                          ) : (
                            <PlusIcon className="h-5 w-5 text-slate-600 dark:text-slate-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : searchQuery ? (
                  <div className="p-8 text-center text-slate-500">No results found</div>
                ) : null}
              </div>
            )}

            {/* Your List (Simple - just items, reorderable) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-300 dark:border-slate-600 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">Your List ({selectedItems.length})</h2>
                {selectedItems.length > 1 && (
                  <span className="text-xs text-slate-500">Drag to reorder</span>
                )}
              </div>

              {selectedItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <FilmIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Search and add {categoryName.toLowerCase()}</p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={selectedItems}
                  onReorder={setSelectedItems}
                  className="divide-y divide-slate-200 dark:divide-slate-700"
                >
                  {selectedItems.map((item, index) => {
                    const imageUrl = getItemImageUrl(item);
                    return (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        className="bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing"
                        whileDrag={{
                          scale: 1.02,
                          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                          zIndex: 50
                        }}
                      >
                        <div className="p-3 flex items-center gap-3">
                          <span className="text-lg font-bold text-slate-300 dark:text-slate-600 w-5">{index + 1}</span>
                          <div className="w-10 h-14 relative overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                            {imageUrl && <Image src={imageUrl} alt={item.name || item.title} fill sizes="40px" className="object-cover" />}
                          </div>
                          <div className="grow min-w-0">
                            <p className="font-medium truncate text-slate-900 dark:text-white">{item.name || item.title}</p>
                            <p className="text-xs text-slate-500">{item.year}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              )}
            </div>

            {/* Next button */}
            {selectedItems.length > 0 && (
              <button
                onClick={nextStage}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100"
              >
                Continue to Finalize
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}

        {/* STAGE 2: FINALIZE */}
        {stage === "finalize" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Ratings & Notes</h2>
                <p className="text-sm text-slate-500 mt-1">Optional - personalize your picks</p>
              </div>
              {selectedItems.length > 1 && (
                <span className="text-xs text-slate-500">Drag to reorder</span>
              )}
            </div>

            <Reorder.Group
              axis="y"
              values={selectedItems}
              onReorder={setSelectedItems}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 divide-y divide-slate-200 dark:divide-slate-700"
            >
              {selectedItems.map((item, index) => {
                const imageUrl = getItemImageUrl(item);
                return (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className="bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing"
                    whileDrag={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                      zIndex: 50
                    }}
                  >
                    <div className="p-4 pointer-events-auto">
                      <div className="flex items-start gap-3">
                        <span className="text-lg font-bold text-slate-300 dark:text-slate-600 w-5 pt-1">{index + 1}</span>
                        <div className="w-12 h-16 relative overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                          {imageUrl && <Image src={imageUrl} alt={item.name || item.title} fill sizes="48px" className="object-cover" />}
                        </div>
                        <div className="grow">
                          <p className="font-medium text-slate-900 dark:text-white">{item.name || item.title}</p>
                          <p className="text-xs text-slate-500 mb-2">{item.year}</p>

                          {/* Rating - collapsed by default */}
                          {item.userRating ? (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => updateItemRating(item.id, item.userRating === star ? null : star)}
                                    className="p-0.5"
                                  >
                                    {star <= item.userRating ? (
                                      <StarIcon className="h-5 w-5 text-amber-500" />
                                    ) : (
                                      <StarOutlineIcon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => updateItemRating(item.id, null)}
                                className="text-xs text-slate-400 hover:text-red-500"
                              >
                                clear
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateItemRating(item.id, 5)}
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-500 mb-2"
                            >
                              <StarOutlineIcon className="h-4 w-4" />
                              Add rating
                            </button>
                          )}

                          {/* Comment - collapsed by default */}
                          {item.comment ? (
                            <div className="relative">
                              <textarea
                                value={item.comment}
                                onChange={(e) => updateItemComment(item.id, e.target.value)}
                                placeholder="Why you love it..."
                                rows={2}
                                className="w-full text-sm px-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-1 focus:ring-slate-500 resize-none pr-12"
                              />
                              <button
                                onClick={() => updateItemComment(item.id, "")}
                                className="absolute top-2 right-2 text-xs text-slate-400 hover:text-red-500"
                              >
                                clear
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateItemComment(item.id, " ")}
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                              <PlusIcon className="h-3 w-3" />
                              Add note
                            </button>
                          )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {/* Navigation */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={prevStage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={nextStage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100"
              >
                Continue to Customize
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: CUSTOMIZE */}
        {stage === "customize" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Live Preview with editable title/description */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 mb-6">
              {/* Editable header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your list a title..."
                  className="w-full text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (optional)..."
                  rows={2}
                  className="w-full mt-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-slate-600 dark:text-slate-400 placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* List preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                <ListThemeRenderer
                  list={previewList}
                  theme={theme}
                  accentColor={accentColor}
                  isEditable={false}
                />
              </div>
            </div>

            {/* Theme & Color selection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 p-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Choose a Theme</label>
              <ThemeSelector
                selectedTheme={theme}
                selectedColor={accentColor}
                onThemeChange={setTheme}
                onColorChange={setAccentColor}
              />
            </div>

            {/* Navigation */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={prevStage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium hover:bg-emerald-700"
              >
                <CheckIcon className="h-4 w-4" />
                Publish List
              </button>
            </div>
          </motion.div>
        )}
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
