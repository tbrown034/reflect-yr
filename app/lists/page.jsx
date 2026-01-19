// app/lists/page.jsx
"use client";

import { use, useEffect, useState } from "react";
import { ListContext } from "@/library/contexts/ListContext";
import Link from "next/link";
import Image from "next/image";
import {
  FilmIcon,
  TrashIcon,
  TvIcon,
  ListBulletIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function MyListsPage() {
  const {
    publishedLists,
    recommendationLists,
    ANONYMOUS_LIST_LIMIT,
    deleteAllPublishedLists,
    deleteAllRecommendationLists,
    getTotalListCount,
    getRemainingListCount,
    hasReachedTotalListLimit,
  } = use(ListContext);

  const [regularLists, setRegularLists] = useState([]);
  const [movieLists, setMovieLists] = useState([]);
  const [tvLists, setTvLists] = useState([]);
  const [movieRecommendations, setMovieRecommendations] = useState([]);
  const [tvRecommendations, setTvRecommendations] = useState([]);
  const [isNearLimit, setIsNearLimit] = useState(false);
  const [isAtLimit, setIsAtLimit] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, movies, tv, recs
  const [deleteAnimation, setDeleteAnimation] = useState(null);

  // Convert the lists object to arrays for rendering, grouped by type
  useEffect(() => {
    // Get all lists and sort by publish date (newest first)
    const allRegularLists = Object.values(publishedLists).sort((a, b) => {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    // Separate by type
    const movieListsArray = allRegularLists.filter(
      (list) => list.type === "movie"
    );
    const tvListsArray = allRegularLists.filter((list) => list.type === "tv");

    // Process recommendation lists
    const allRecommendationLists = Object.values(recommendationLists).sort(
      (a, b) => {
        return new Date(b.savedAt) - new Date(a.savedAt);
      }
    );

    // Separate recommendation lists by type
    const movieRecsArray = allRecommendationLists.filter(
      (list) => list.type === "movie"
    );
    const tvRecsArray = allRecommendationLists.filter(
      (list) => list.type === "tv"
    );

    setRegularLists(allRegularLists);
    setMovieLists(movieListsArray);
    setTvLists(tvListsArray);
    setMovieRecommendations(movieRecsArray);
    setTvRecommendations(tvRecsArray);

    // Check if we're near or at the limit
    const remainingLists = getRemainingListCount();
    setIsNearLimit(remainingLists <= 1 && getTotalListCount() > 0);
    setIsAtLimit(hasReachedTotalListLimit());

    // Auto-select tab based on what's available
    if (allRegularLists.length === 0 && allRecommendationLists.length > 0) {
      setActiveTab("recs");
    } else if (movieListsArray.length > 0 && tvListsArray.length === 0) {
      setActiveTab("movies");
    } else if (movieListsArray.length === 0 && tvListsArray.length > 0) {
      setActiveTab("tv");
    }
  }, [
    publishedLists,
    recommendationLists,
    hasReachedTotalListLimit,
    getTotalListCount,
    getRemainingListCount,
    ANONYMOUS_LIST_LIMIT,
  ]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  // Handle delete all lists with animation and confirmation
  const handleDeleteAllLists = () => {
    if (regularLists.length === 0) {
      alert("You don't have any lists to delete.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete all ${regularLists.length} of your lists? This cannot be undone.`
      )
    ) {
      setDeleteAnimation("lists");
      setTimeout(() => {
        deleteAllPublishedLists();
        setDeleteAnimation(null);
      }, 500);
    }
  };

  // Handle delete all recommendation lists with animation and confirmation
  const handleDeleteAllRecommendations = () => {
    const totalRecs = movieRecommendations.length + tvRecommendations.length;

    if (totalRecs === 0) {
      alert("You don't have any recommendation lists to delete.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete all ${totalRecs} of your recommendation lists? This cannot be undone.`
      )
    ) {
      setDeleteAnimation("recs");
      setTimeout(() => {
        deleteAllRecommendationLists();
        setDeleteAnimation(null);
      }, 500);
    }
  };

  // Get lists for current tab
  const getVisibleLists = () => {
    switch (activeTab) {
      case "movies":
        return { lists: movieLists, type: "movie", isRec: false };
      case "tv":
        return { lists: tvLists, type: "tv", isRec: false };
      case "recs":
        return {
          lists: [...movieRecommendations, ...tvRecommendations],
          type: "mixed",
          isRec: true,
        };
      default:
        return {
          lists: [
            ...regularLists,
            ...movieRecommendations,
            ...tvRecommendations,
          ],
          type: "mixed",
          isRec: false,
        };
    }
  };

  // Calculate counts for tabs
  const regularCount = regularLists.length;
  const movieCount = movieLists.length;
  const tvCount = tvLists.length;
  const recsCount = movieRecommendations.length + tvRecommendations.length;
  const totalCount = regularCount + recsCount;

  // Helper function to render a list card
  const renderListCard = (list, isRecommendation = false) => {
    const type = list.type;
    const urlType = type === "movie" ? "movies" : "tv";
    const itemCount = list.items?.length || 0;

    // Get first item poster for display
    const firstItem = list.items?.[0];
    const posterPath = firstItem?.poster_path
      ? `https://image.tmdb.org/t/p/w300${firstItem.poster_path}`
      : type === "movie"
      ? "/placeholder-movie.jpg"
      : "/placeholder-tv.jpg";

    const path = isRecommendation
      ? `/lists/${urlType}/saved-recommendations/${list.id}`
      : `/lists/${urlType}/publish/${list.id}`;

    return (
      <motion.div
        key={list.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
          isRecommendation
            ? "border-l-4 border-purple-500 dark:border-purple-400"
            : type === "movie"
            ? "border-l-4 border-blue-500 dark:border-blue-400"
            : "border-l-4 border-purple-600 dark:border-purple-500"
        }`}
      >
        {/* Background poster with gradient overlay */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
          <Image
            src={posterPath}
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-sm"
            priority={false}
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        </div>

        <Link href={path} className="block h-full">
          <div className="relative z-10 p-4 flex items-center">
            <div className="shrink-0 mr-4">
              {isRecommendation ? (
                <div className="relative w-16 h-20 rounded overflow-hidden bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <SparklesIcon className="h-8 w-8 text-purple-500 dark:text-purple-300" />
                  <Image
                    src={posterPath}
                    alt="List preview"
                    fill
                    sizes="64px"
                    className="object-cover opacity-40"
                  />
                </div>
              ) : (
                <div className="relative w-16 h-20 rounded overflow-hidden">
                  <Image
                    src={posterPath}
                    alt="List preview"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grow min-w-0">
              <div className="flex items-center">
                {isRecommendation ? (
                  <SparklesIcon className="shrink-0 h-5 w-5 text-purple-500 mr-1.5" />
                ) : type === "movie" ? (
                  <FilmIcon className="shrink-0 h-5 w-5 text-blue-500 mr-1.5" />
                ) : (
                  <TvIcon className="shrink-0 h-5 w-5 text-purple-500 mr-1.5" />
                )}
                <h2 className="text-lg font-semibold truncate">{list.title}</h2>
              </div>

              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={list.publishedAt || list.savedAt}>
                  {formatDate(list.publishedAt || list.savedAt)}
                </time>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <ListBulletIcon className="h-4 w-4 mr-1" />
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {itemCount > 0
                  ? `View your ${isRecommendation ? "recommended" : "ranked"} ${
                      type === "movie" ? "movies" : "TV shows"
                    }`
                  : `Empty ${type === "movie" ? "movie" : "TV show"} list`}
              </p>
            </div>

            <div className="shrink-0 ml-4">
              <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                <ArrowRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // Render the lists grid
  const renderListsGrid = () => {
    const { lists, type, isRec } = getVisibleLists();

    if (lists.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            {activeTab === "movies" ? (
              <FilmIcon className="h-12 w-12 text-blue-500 dark:text-blue-400" />
            ) : activeTab === "tv" ? (
              <TvIcon className="h-12 w-12 text-purple-500 dark:text-purple-400" />
            ) : activeTab === "recs" ? (
              <SparklesIcon className="h-12 w-12 text-purple-500 dark:text-purple-400" />
            ) : (
              <ListBulletIcon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {activeTab === "movies"
              ? "No Movie Lists Yet"
              : activeTab === "tv"
              ? "No TV Show Lists Yet"
              : activeTab === "recs"
              ? "No Recommendations Yet"
              : "No Lists Yet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
            {activeTab === "recs"
              ? "Get personalized recommendations based on your lists."
              : "Start by browsing and creating lists of your favorite content."}
          </p>
          {/* NOTE: TV browse option kept in code but hidden from UI for movie-focused MVP */}
          <div className="flex flex-wrap justify-center gap-3">
            {activeTab === "movies" || activeTab === "all" ? (
              <Link
                href="/movies"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FilmIcon className="h-5 w-5 mr-2" />
                Browse Movies
              </Link>
            ) : null}
            {/* {activeTab === "tv" || activeTab === "all" ? (
              <Link
                href="/tv"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <TvIcon className="h-5 w-5 mr-2" />
                Browse TV Shows
              </Link>
            ) : null} */}
            {activeTab === "recs" && regularCount > 0 ? (
              <Link
                href={
                  regularLists[0]
                    ? `/lists/${
                        regularLists[0].type === "movie" ? "movies" : "tv"
                      }/publish/${regularLists[0].id}`
                    : "/"
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Get Recommendations
              </Link>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={false}
        animate={{
          opacity: deleteAnimation ? 0 : 1,
          scale: deleteAnimation ? 0.95 : 1,
        }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {lists.map((list) =>
          renderListCard(list, isRec || list.type === "recommendation")
        )}
      </motion.div>
    );
  };

  // Empty state when no lists exist
  if (totalCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-6"
          >
            <ListBulletIcon className="h-20 w-20 text-blue-600 dark:text-blue-400" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-4">Your Lists Journey Begins</h1>

          <p className="text-gray-600 dark:text-gray-300 max-w-lg mb-8 text-lg">
            Discover, rank, and save your favorite entertainment. Create lists
            to keep track of what you love and get personalized recommendations.
          </p>

          {/* Primary CTA - Create a List */}
          <Link
            href="/create"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-lg font-medium"
          >
            <SparklesIcon className="h-6 w-6" />
            Create Your First List
          </Link>

          <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
            or browse to discover content
          </p>

          {/* NOTE: TV browse option kept in code but hidden from UI for movie-focused MVP */}
          <div className="flex justify-center w-full max-w-lg mt-4">
            <Link
              href="/movies"
              className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-md border border-gray-200 dark:border-gray-600"
            >
              <FilmIcon className="h-6 w-6 text-blue-500" />
              <span className="font-medium">Browse Movies</span>
            </Link>

            {/* <Link
              href="/tv"
              className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-md border border-gray-200 dark:border-gray-600"
            >
              <TvIcon className="h-6 w-6 text-purple-500" />
              <span className="font-medium">Browse TV Shows</span>
            </Link> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Lists</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalCount} {totalCount === 1 ? "list" : "lists"} in your
            collection
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {regularLists.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAllLists}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors"
              title="Delete all your lists permanently"
            >
              <TrashIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Delete All Lists</span>
              <span className="sm:hidden">Delete Lists</span>
            </motion.button>
          )}

          {recsCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAllRecommendations}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors"
              title="Delete all your recommendation lists permanently"
            >
              <TrashIcon className="h-5 w-5" />
              <span className="hidden sm:inline">
                Delete All Recommendations
              </span>
              <span className="sm:hidden">Delete Recs</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Limit warning banner */}
      {isNearLimit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mb-6 p-4 rounded-xl shadow-md ${
            isAtLimit
              ? "bg-linear-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-800/50"
              : "bg-linear-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-200 dark:border-amber-800/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon
              className={`h-6 w-6 shrink-0 mt-0.5 ${
                isAtLimit
                  ? "text-red-500 dark:text-red-400"
                  : "text-amber-500 dark:text-amber-400"
              }`}
            />
            <div>
              <p
                className={`font-medium text-lg ${
                  isAtLimit
                    ? "text-red-800 dark:text-red-300"
                    : "text-amber-800 dark:text-amber-300"
                }`}
              >
                {isAtLimit
                  ? `You've reached the maximum of ${ANONYMOUS_LIST_LIMIT} total lists`
                  : `${getRemainingListCount()} ${
                      getRemainingListCount() !== 1 ? "lists" : "list"
                    } remaining before you reach the limit`}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                Create an account to unlock unlimited lists and sync across
                devices
              </p>
              <div className="mt-3">
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  <span className="font-medium">Sign Up</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* List filtering tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 px-1 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("all")}
            className={`relative pb-3 px-2 text-sm font-medium ${
              activeTab === "all"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            All Lists
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
              {totalCount}
            </span>
            {activeTab === "all" && (
              <motion.span
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>

          {movieCount > 0 && (
            <button
              onClick={() => setActiveTab("movies")}
              className={`relative pb-3 px-2 text-sm font-medium ${
                activeTab === "movies"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="flex items-center">
                <FilmIcon className="h-4 w-4 mr-1.5" />
                Movies
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
                  {movieCount}
                </span>
              </span>
              {activeTab === "movies" && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                />
              )}
            </button>
          )}

          {tvCount > 0 && (
            <button
              onClick={() => setActiveTab("tv")}
              className={`relative pb-3 px-2 text-sm font-medium ${
                activeTab === "tv"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="flex items-center">
                <TvIcon className="h-4 w-4 mr-1.5" />
                TV Shows
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
                  {tvCount}
                </span>
              </span>
              {activeTab === "tv" && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                />
              )}
            </button>
          )}

          {recsCount > 0 && (
            <button
              onClick={() => setActiveTab("recs")}
              className={`relative pb-3 px-2 text-sm font-medium ${
                activeTab === "recs"
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="flex items-center">
                <SparklesIcon className="h-4 w-4 mr-1.5" />
                Recommendations
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
                  {recsCount}
                </span>
              </span>
              {activeTab === "recs" && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main content - lists grid */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderListsGrid()}
      </motion.div>

      {/* Add new list button (floating) */}
      <Link
        href="/create"
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center z-10"
        title="Create a new list"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>
    </div>
  );
}
