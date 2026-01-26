"use client";

// components/layout/hero/ExampleList.jsx
// Interactive demo showing how list creation works

import { useState, use, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FilmIcon, CheckIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon, ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { searchByCategory } from "@/app/actions/search";

// Start with 4 movies - user can add a 5th
const STARTER_ITEMS = [
  {
    id: "693134",
    title: "Dune: Part Two",
    year: 2024,
    poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  },
  {
    id: "872585",
    title: "Oppenheimer",
    year: 2023,
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  },
  {
    id: "792307",
    title: "Poor Things",
    year: 2023,
    poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
  },
  {
    id: "666277",
    title: "Past Lives",
    year: 2023,
    poster_path: "/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
  },
];

// Themes that actually look good in preview
const THEMES = [
  { id: "classic", name: "Classic" },
  { id: "podium", name: "Podium" },
  { id: "minimalist", name: "Minimalist" },
];

function SortableItem({ item, index, onRemove, canRemove }) {
  const [imageError, setImageError] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w154${item.poster_path}`
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        ${isDragging ? "shadow-lg ring-2 ring-slate-900 dark:ring-white z-10 scale-[1.02]" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}
        transition-all
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="p-1 rounded cursor-grab active:cursor-grabbing touch-none hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <Bars3Icon className="w-4 h-4 text-slate-400" />
      </div>

      <span className="w-5 text-center font-bold text-slate-400 text-sm">
        {index + 1}
      </span>

      <div className="relative w-8 h-12 rounded overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt=""
            fill
            sizes="32px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmIcon className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
          {item.title}
        </p>
        <p className="text-xs text-slate-500">{item.year}</p>
      </div>

      {canRemove && (
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Clean theme previews that match actual themes
function ThemePreview({ items, theme }) {
  const posterUrl = (item) =>
    item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : null;

  if (theme === "podium") {
    // Olympic podium style - 2nd, 1st, 3rd (scaled to fit preview)
    const [first, second, third] = [items[0], items[1], items[2]];
    return (
      <div className="flex items-end justify-center gap-1.5 h-full pt-2">
        {/* 2nd place */}
        <div className="flex flex-col items-center">
          <div className="relative w-10 h-14 rounded overflow-hidden bg-slate-600 mb-1">
            {second && posterUrl(second) && (
              <Image src={posterUrl(second)} alt="" fill sizes="40px" className="object-cover" />
            )}
          </div>
          <div className="w-12 h-12 bg-gradient-to-b from-slate-400 to-slate-500 rounded-t flex items-start justify-center pt-1">
            <span className="text-[10px] font-bold text-white">2nd</span>
          </div>
        </div>
        {/* 1st place */}
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-16 rounded overflow-hidden bg-slate-600 mb-1 ring-2 ring-amber-400">
            {first && posterUrl(first) && (
              <Image src={posterUrl(first)} alt="" fill sizes="48px" className="object-cover" />
            )}
          </div>
          <div className="w-14 h-14 bg-gradient-to-b from-amber-400 to-amber-500 rounded-t flex items-start justify-center pt-1">
            <span className="text-[10px] font-bold text-white">1st</span>
          </div>
        </div>
        {/* 3rd place */}
        <div className="flex flex-col items-center">
          <div className="relative w-9 h-12 rounded overflow-hidden bg-slate-600 mb-1">
            {third && posterUrl(third) && (
              <Image src={posterUrl(third)} alt="" fill sizes="36px" className="object-cover" />
            )}
          </div>
          <div className="w-11 h-10 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t flex items-start justify-center pt-1">
            <span className="text-[10px] font-bold text-white">3rd</span>
          </div>
        </div>
      </div>
    );
  }

  if (theme === "minimalist") {
    return (
      <div className="space-y-2 py-2 font-serif">
        {items.slice(0, 5).map((item, i) => (
          <div key={item.id} className="flex items-baseline gap-3">
            <span className="text-sm text-slate-500 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm text-white">{item.title}</span>
            <span className="text-xs text-slate-500">{item.year}</span>
          </div>
        ))}
      </div>
    );
  }

  // Classic - numbered list with posters
  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((item, i) => (
        <div key={item.id} className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-2">
          <span className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
            {i + 1}
          </span>
          <div className="relative w-8 h-12 rounded overflow-hidden bg-slate-600 shrink-0">
            {posterUrl(item) && (
              <Image src={posterUrl(item)} alt="" fill sizes="32px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white truncate">{item.title}</p>
            <p className="text-xs text-slate-400">{item.year}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExampleList() {
  const [stage, setStage] = useState(0); // 0: rank, 1: style, 2: done
  const [items, setItems] = useState(STARTER_ITEMS);
  const [selectedTheme, setSelectedTheme] = useState("classic");
  const [listTitle, setListTitle] = useState("My Top Movies");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleRemove = (id) => {
    setItems((items) => items.filter((item) => item.id !== id));
  };

  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const { results } = await searchByCategory(query, "movie", { limit: 5 });
    // Filter out items already in the list
    const filtered = (results || []).filter(
      (r) => !items.some((i) => i.id === String(r.id))
    );
    setSearchResults(filtered);
    setIsSearching(false);
  }, [items]);

  const handleAddItem = (result) => {
    const newItem = {
      id: String(result.id),
      title: result.name || result.title,
      year: result.year || (result.release_date ? parseInt(result.release_date.split("-")[0]) : null),
      poster_path: result.poster_path || result.image?.replace("https://image.tmdb.org/t/p/w500", ""),
    };
    setItems((prev) => [...prev, newItem]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const stages = ["Select", "Style", "Done"];

  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-4 mb-8">
      <div className="border-b border-slate-300 dark:border-slate-600 pb-2 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Try It Out
        </h2>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Stage indicator */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            {stages.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    i < stage
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : i === stage
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 ring-offset-slate-50 dark:ring-offset-slate-800"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {i < stage ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < stages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      i < stage ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {stages.map((s, i) => (
              <span
                key={s}
                className={`text-[10px] font-medium ${
                  i <= stage ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4">
          {/* Stage 0: Select & Rank */}
          {stage === 0 && (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Drag to reorder. Add or remove movies to customize.
              </p>

              <DndContext
                id="example-list-dnd"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {items.map((item, index) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        index={index}
                        onRemove={handleRemove}
                        canRemove={items.length > 3}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add movie section */}
              {items.length < 10 && (
                <div className="mt-3">
                  {showSearch ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch(e.target.value);
                          }}
                          placeholder="Search for a movie..."
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                          autoFocus
                        />
                      </div>
                      {isSearching && (
                        <p className="text-xs text-slate-500 px-1">Searching...</p>
                      )}
                      {searchResults.length > 0 && (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => handleAddItem(result)}
                              className="w-full flex items-center gap-2 p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <div className="relative w-6 h-9 rounded overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                                {result.poster_path && (
                                  <Image
                                    src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                                    alt=""
                                    fill
                                    sizes="24px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-slate-900 dark:text-white truncate">
                                  {result.name || result.title}
                                </p>
                                <p className="text-xs text-slate-500">{result.year}</p>
                              </div>
                              <PlusIcon className="w-4 h-4 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600 dark:hover:border-slate-500 dark:hover:text-slate-400 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add a movie
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => setStage(1)}
                disabled={items.length < 3}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Next: Pick a Style
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Stage 1: Style */}
          {stage === 1 && (
            <>
              <div className="mb-4">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  List Title
                </label>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">
                Choose a Theme
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative rounded-lg overflow-hidden transition-all ${
                      selectedTheme === theme.id
                        ? "ring-2 ring-slate-900 dark:ring-white"
                        : "ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-slate-300 dark:hover:ring-slate-600"
                    }`}
                  >
                    {/* Theme preview */}
                    <div className="bg-slate-800 p-3 h-36 overflow-hidden">
                      <ThemePreview items={items} theme={theme.id} />
                    </div>
                    {/* Theme name */}
                    <div
                      className={`px-3 py-2 text-center ${
                        selectedTheme === theme.id
                          ? "bg-slate-900 dark:bg-white"
                          : "bg-slate-100 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          selectedTheme === theme.id
                            ? "text-white dark:text-slate-900"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {theme.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStage(0)}
                  className="flex items-center justify-center gap-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => setStage(2)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium"
                >
                  Preview
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Stage 2: Done */}
          {stage === 2 && (
            <div>
              {/* Preview header */}
              <div className="text-center mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  {listTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {items.length} movies · {selectedTheme} theme
                </p>
              </div>

              {/* Full preview */}
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <ThemePreview items={items} theme={selectedTheme} />
              </div>

              {/* CTA section */}
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-5 text-center">
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-1">
                  That's how easy it is.
                </p>
                <p className="text-slate-900 dark:text-white font-semibold mb-4">
                  Ready to create your own list?
                </p>

                <div className="space-y-2">
                  <Link
                    href="/create"
                    className="block w-full px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-semibold"
                  >
                    Get Started
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 justify-center pt-2">
                    <span>Save</span>
                    <span>·</span>
                    <span>Share</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <SparklesIcon className="w-3 h-3" />
                      Get AI Recommendations
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStage(0);
                    setItems(STARTER_ITEMS);
                    setSelectedTheme("classic");
                    setListTitle("My Top Movies");
                  }}
                  className="mt-4 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Try again with different movies
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
