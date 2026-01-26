// app/lists/page.jsx
"use client";

import { use, useState, useMemo } from "react";
import { ListContext } from "@/library/contexts/ListContext";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { calculateListsStats, getPublicShareUrl } from "@/library/utils/listUtils";

import EnhancedListCard from "./_components/EnhancedListCard";
import ListPreviewModal from "./_components/ListPreviewModal";
import EmptyListsState from "./_components/EmptyListsState";

// Map internal category types to URL-friendly plural forms
const CATEGORY_TO_URL = {
  movie: "movies",
  tv: "tv",
  book: "books",
  podcast: "podcasts",
  album: "albums",
  custom: "custom",
};

export default function MyListsPage() {
  const {
    publishedLists,
    recommendationLists,
    ANONYMOUS_LIST_LIMIT,
    deletePublishedList,
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
    const urlType = CATEGORY_TO_URL[list.type] || list.type;
    const url = list.shareCode
      ? getPublicShareUrl(list.shareCode)
      : `${window.location.origin}/lists/${urlType}/publish/${list.id}`;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">My Lists</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {counts.all} {counts.all === 1 ? "list" : "lists"} · {stats.totalItems || 0} items ranked
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New List</span>
        </Link>
      </div>

      {/* Limit Warning */}
      {isNearLimit && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isAtLimit
            ? "bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600"
            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
        }`}>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {isAtLimit
              ? `You've reached ${ANONYMOUS_LIST_LIMIT} lists.`
              : `${getRemainingListCount()} list${getRemainingListCount() !== 1 ? "s" : ""} remaining.`}
            {" "}
            <Link href="/profile" className="font-medium underline">
              Sign in
            </Link>
            {" "}for unlimited lists.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto -mx-4 px-4">
        <div className="flex gap-1 min-w-max">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "movies", label: "Movies", count: counts.movies },
            { id: "tv", label: "TV", count: counts.tv },
            { id: "books", label: "Books", count: counts.books },
            { id: "podcasts", label: "Podcasts", count: counts.podcasts },
            { id: "recs", label: "Saved Recs", count: counts.recs },
          ]
            .filter((tab) => tab.count > 0 || tab.id === "all")
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1.5 text-xs ${
                    activeTab === tab.id
                      ? "text-slate-300 dark:text-slate-600"
                      : "text-slate-400 dark:text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
        </div>
      </div>

      {/* Lists */}
      {visibleLists.lists.length === 0 ? (
        <EmptyListsState activeTab={activeTab} />
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
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

      {/* FAB for mobile */}
      <Link
        href="/create"
        className="fixed bottom-6 right-6 z-40 p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-lg hover:shadow-xl transition-shadow sm:hidden"
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
