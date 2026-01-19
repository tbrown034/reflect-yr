"use client";

import { use, useState, useEffect, useMemo } from "react";
import { ListContext } from "@/library/contexts/ListContext";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChevronDownIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";

const LOG_PREFIX = "[ComparePage]";

export default function ComparePage() {
  const { publishedLists, isInitialized } = use(ListContext);

  const [list1Id, setList1Id] = useState(null);
  const [list2Id, setList2Id] = useState(null);

  console.log(`${LOG_PREFIX} Rendering compare page`);

  // Get all lists as array
  const allLists = useMemo(() => {
    return Object.values(publishedLists).filter((l) => l.type === "movie");
  }, [publishedLists]);

  const list1 = list1Id ? publishedLists[list1Id] : null;
  const list2 = list2Id ? publishedLists[list2Id] : null;

  // Calculate comparison stats
  const comparison = useMemo(() => {
    if (!list1 || !list2) return null;

    const list1Ids = new Set(list1.items.map((i) => i.id));
    const list2Ids = new Set(list2.items.map((i) => i.id));

    // Find overlapping movies
    const overlap = list1.items.filter((item) => list2Ids.has(item.id));

    // Find unique to each list
    const uniqueToList1 = list1.items.filter((item) => !list2Ids.has(item.id));
    const uniqueToList2 = list2.items.filter((item) => !list1Ids.has(item.id));

    // Find rank differences for overlapping movies
    const rankComparisons = overlap.map((item) => {
      const list1Rank = list1.items.findIndex((i) => i.id === item.id) + 1;
      const list2Rank = list2.items.findIndex((i) => i.id === item.id) + 1;
      return {
        ...item,
        list1Rank,
        list2Rank,
        rankDiff: Math.abs(list1Rank - list2Rank),
        sameRank: list1Rank === list2Rank,
      };
    });

    // Calculate overlap percentage
    const overlapPercent = Math.round(
      (overlap.length / Math.max(list1.items.length, list2.items.length)) * 100
    );

    // Find each list's #1 pick
    const list1Top = list1.items[0];
    const list2Top = list2.items[0];
    const sameTopPick = list1Top?.id === list2Top?.id;

    console.log(`${LOG_PREFIX} Comparison stats:`, {
      overlap: overlap.length,
      uniqueToList1: uniqueToList1.length,
      uniqueToList2: uniqueToList2.length,
      overlapPercent,
      sameTopPick,
    });

    return {
      overlap,
      uniqueToList1,
      uniqueToList2,
      rankComparisons: rankComparisons.sort((a, b) => a.list1Rank - b.list1Rank),
      overlapPercent,
      sameTopPick,
      list1Top,
      list2Top,
    };
  }, [list1, list2]);

  // Auto-select first two lists if available
  useEffect(() => {
    if (isInitialized && allLists.length >= 2 && !list1Id && !list2Id) {
      setList1Id(allLists[0].id);
      setList2Id(allLists[1].id);
    }
  }, [isInitialized, allLists, list1Id, list2Id]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (allLists.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ArrowsRightLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Compare Lists
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need at least 2 published lists to compare. Create some lists first!
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <SparklesIcon className="h-5 w-5" />
            Create a List
          </Link>
        </div>
      </div>
    );
  }

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

          <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowsRightLeftIcon className="h-5 w-5 text-purple-500" />
            Compare Lists
          </h1>

          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* List Selectors */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* List 1 Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First List
            </label>
            <select
              value={list1Id || ""}
              onChange={(e) => setList1Id(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="">Select a list...</option>
              {allLists.map((list) => (
                <option key={list.id} value={list.id} disabled={list.id === list2Id}>
                  {list.title} ({list.items.length} movies)
                </option>
              ))}
            </select>
          </div>

          {/* List 2 Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Second List
            </label>
            <select
              value={list2Id || ""}
              onChange={(e) => setList2Id(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="">Select a list...</option>
              {allLists.map((list) => (
                <option key={list.id} value={list.id} disabled={list.id === list1Id}>
                  {list.title} ({list.items.length} movies)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Results */}
        <AnimatePresence mode="wait">
          {comparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {comparison.overlapPercent}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Overlap
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {comparison.overlap.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Shared Movies
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {comparison.uniqueToList1.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Unique to List 1
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {comparison.uniqueToList2.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Unique to List 2
                  </div>
                </div>
              </div>

              {/* Top Pick Comparison */}
              <div className="bg-linear-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrophyIcon className="h-5 w-5 text-yellow-500" />
                  Top Picks
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* List 1 Top */}
                  {comparison.list1Top && (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-24 relative rounded-lg overflow-hidden shadow-lg">
                        {comparison.list1Top.poster_path && (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${comparison.list1Top.poster_path}`}
                            alt={comparison.list1Top.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {list1?.title}'s #1
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comparison.list1Top.title}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* List 2 Top */}
                  {comparison.list2Top && (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-24 relative rounded-lg overflow-hidden shadow-lg">
                        {comparison.list2Top.poster_path && (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${comparison.list2Top.poster_path}`}
                            alt={comparison.list2Top.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {list2?.title}'s #1
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comparison.list2Top.title}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {comparison.sameTopPick && (
                  <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="font-medium">Same #1 pick!</span>
                  </div>
                )}
              </div>

              {/* Shared Movies with Rank Comparison */}
              {comparison.rankComparisons.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Shared Movies ({comparison.overlap.length})
                  </h3>

                  <div className="space-y-3">
                    {comparison.rankComparisons.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="w-10 h-14 relative rounded overflow-hidden shrink-0">
                          {item.poster_path && (
                            <Image
                              src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                              alt={item.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>

                        <div className="grow min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                        </div>

                        {/* Rank Comparison */}
                        <div className="flex items-center gap-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded ${
                              item.list1Rank <= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            #{item.list1Rank}
                          </span>

                          {item.sameRank ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-400" />
                          )}

                          <span
                            className={`px-2 py-1 rounded ${
                              item.list2Rank <= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            #{item.list2Rank}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side by Side Unique Picks */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Unique to List 1 */}
                {comparison.uniqueToList1.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-blue-600">
                      Only in {list1?.title}
                    </h3>
                    <div className="space-y-2">
                      {comparison.uniqueToList1.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2"
                        >
                          <span className="text-gray-400 w-5">
                            #{list1.items.findIndex((i) => i.id === item.id) + 1}
                          </span>
                          <div className="w-8 h-12 relative rounded overflow-hidden shrink-0">
                            {item.poster_path && (
                              <Image
                                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                alt={item.title}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unique to List 2 */}
                {comparison.uniqueToList2.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-orange-600">
                      Only in {list2?.title}
                    </h3>
                    <div className="space-y-2">
                      {comparison.uniqueToList2.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2"
                        >
                          <span className="text-gray-400 w-5">
                            #{list2.items.findIndex((i) => i.id === item.id) + 1}
                          </span>
                          <div className="w-8 h-12 relative rounded overflow-hidden shrink-0">
                            {item.poster_path && (
                              <Image
                                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                alt={item.title}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {(!list1Id || !list2Id) && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <ArrowsRightLeftIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select two lists above to compare them</p>
          </div>
        )}
      </main>
    </div>
  );
}
