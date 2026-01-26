// app/lists/page.jsx
"use client";

import { use, useEffect, useState, useMemo } from "react";
import { ListContext } from "@/library/contexts/ListContext";
import Link from "next/link";
import {
  FilmIcon,
  TrashIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
  SparklesIcon,
  PlusIcon,
  ExclamationCircleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { calculateListsStats, getPublicShareUrl } from "@/library/utils/listUtils";

// Import new components
import ListStatsHeader from "./_components/ListStatsHeader";
import EnhancedListCard from "./_components/EnhancedListCard";
import ListPreviewModal from "./_components/ListPreviewModal";
import EmptyListsState from "./_components/EmptyListsState";

export default function MyListsPage() {
  const {
    publishedLists,
    recommendationLists,
    ANONYMOUS_LIST_LIMIT,
    deletePublishedList,
    deleteAllPublishedLists,
    deleteAllRecommendationLists,
    deleteRecommendationList,
    getTotalListCount,
    getRemainingListCount,
    hasReachedTotalListLimit,
  } = use(ListContext);

  const [activeTab, setActiveTab] = useState("all");
  const [previewList, setPreviewList] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Calculate all lists and organize by type
  const { allLists, movieLists, tvLists, bookLists, podcastLists, recommendations, stats } = useMemo(() => {
    const published = Object.values(publishedLists).sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );
    const recs = Object.values(recommendationLists).sort(
      (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
    );

    return {
      allLists: published,
      movieLists: published.filter((l) => l.type === "movie"),
      tvLists: published.filter((l) => l.type === "tv"),
      bookLists: published.filter((l) => l.type === "book"),
      podcastLists: published.filter((l) => l.type === "podcast"),
      recommendations: recs,
      stats: calculateListsStats(publishedLists),
    };
  }, [publishedLists, recommendationLists]);

  // Tab counts
  const counts = {
    all: allLists.length + recommendations.length,
    movies: movieLists.length,
    tv: tvLists.length,
    books: bookLists.length,
    podcasts: podcastLists.length,
    recs: recommendations.length,
  };

  // Limit warnings
  const isNearLimit = getRemainingListCount() <= 1 && getTotalListCount() > 0;
  const isAtLimit = hasReachedTotalListLimit();

  // Get visible lists based on active tab
  const visibleLists = useMemo(() => {
    switch (activeTab) {
      case "movies":
        return { lists: movieLists, isRec: false };
      case "tv":
        return { lists: tvLists, isRec: false };
      case "books":
        return { lists: bookLists, isRec: false };
      case "podcasts":
        return { lists: podcastLists, isRec: false };
      case "recs":
        return { lists: recommendations, isRec: true };
      default:
        return { lists: [...allLists, ...recommendations], isRec: false };
    }
  }, [activeTab, allLists, movieLists, tvLists, bookLists, podcastLists, recommendations]);

  // Handlers
  const handleDelete = (listId) => {
    deletePublishedList(listId);
  };

  const handleDeleteRec = (listId) => {
    deleteRecommendationList(listId);
  };

  const handleShare = async (list) => {
    const url = list.shareCode
      ? getPublicShareUrl(list.shareCode)
      : `${window.location.origin}/lists/${list.type === "movie" ? "movies" : list.type}/publish/${list.id}`;

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {
      alert(`Share link: ${url}`);
    }
  };

  const handlePreview = (list) => {
    setPreviewList(list);
    setIsPreviewOpen(true);
  };

  const handleDeleteAllLists = () => {
    if (allLists.length === 0) return;
    if (window.confirm(`Delete all ${allLists.length} lists? This cannot be undone.`)) {
      deleteAllPublishedLists();
    }
  };

  const handleDeleteAllRecs = () => {
    if (recommendations.length === 0) return;
    if (window.confirm(`Delete all ${recommendations.length} recommendation lists? This cannot be undone.`)) {
      deleteAllRecommendationLists();
    }
  };

  // Empty state
  if (counts.all === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 max-w-6xl">
        <EmptyListsState activeTab={activeTab} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">My Lists</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {counts.all} {counts.all === 1 ? "list" : "lists"} in your collection
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base min-h-[44px]"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New List</span>
          </Link>

          {allLists.length > 0 && (
            <button
              onClick={handleDeleteAllLists}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base min-h-[44px]"
            >
              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Delete All</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Header */}
      <ListStatsHeader stats={stats} />

      {/* Limit Warning */}
      {isNearLimit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md ${
            isAtLimit
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50"
              : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon
              className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 mt-0.5 ${
                isAtLimit ? "text-red-500" : "text-amber-500"
              }`}
            />
            <div>
              <p className={`font-medium text-sm sm:text-base ${isAtLimit ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>
                {isAtLimit
                  ? `You've reached the maximum of ${ANONYMOUS_LIST_LIMIT} lists`
                  : `${getRemainingListCount()} list${getRemainingListCount() !== 1 ? "s" : ""} remaining`}
              </p>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
                Sign up to unlock unlimited lists
              </p>
              <button className="mt-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 min-h-[44px]">
                <UserIcon className="h-4 w-4" />
                Sign Up
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="mb-4 sm:mb-6 overflow-x-auto">
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 min-w-max">
          {[
            { id: "all", label: "All", count: counts.all, icon: null },
            { id: "movies", label: "Movies", count: counts.movies, icon: FilmIcon },
            { id: "tv", label: "TV", count: counts.tv, icon: TvIcon },
            { id: "books", label: "Books", count: counts.books, icon: BookOpenIcon },
            { id: "podcasts", label: "Podcasts", count: counts.podcasts, icon: MicrophoneIcon },
            { id: "recs", label: "AI Recs", count: counts.recs, icon: SparklesIcon },
          ]
            .filter((tab) => tab.count > 0 || tab.id === "all")
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                  activeTab === tab.id
                    ? tab.id === "recs"
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5">
                  {tab.icon && <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  {tab.label}
                  <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-gray-100 dark:bg-gray-800">
                    {tab.count}
                  </span>
                </span>
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      tab.id === "recs" ? "bg-purple-600" : "bg-blue-600"
                    }`}
                  />
                )}
              </button>
            ))}
        </div>
      </div>

      {/* Lists Grid */}
      {visibleLists.lists.length === 0 ? (
        <EmptyListsState activeTab={activeTab} />
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
        >
          {visibleLists.lists.map((list) => (
            <EnhancedListCard
              key={list.id}
              list={list}
              isRecommendation={visibleLists.isRec || !!list.savedAt}
              onDelete={visibleLists.isRec ? handleDeleteRec : handleDelete}
              onShare={handleShare}
              onPreview={handlePreview}
            />
          ))}
        </motion.div>
      )}

      {/* FAB for creating new list */}
      <Link
        href="/create"
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all min-h-[56px] min-w-[56px] flex items-center justify-center"
        aria-label="Create new list"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>

      {/* Preview Modal */}
      <ListPreviewModal
        list={previewList}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewList(null);
        }}
      />
    </div>
  );
}
