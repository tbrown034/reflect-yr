"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  HomeIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { use } from "react";
import { ListContext } from "@/library/contexts/ListContext";

/**
 * DetailPageActions - Action buttons for media detail pages
 * Supports all categories: movie, tv, book, podcast
 */
export default function DetailPageActions({ itemType, item }) {
  const router = useRouter();
  const { isInTempList, addToTempList, removeFromTempList, tempLists } = use(ListContext);

  // Normalize category name
  const category = itemType === "tv show" ? "tv" : itemType;

  // Check if item is in the staging list
  const checkIfInList = useCallback(() => {
    if (!item || !item.id) return false;
    return isInTempList(category, item.id);
  }, [item, category, isInTempList]);

  const [inList, setInList] = useState(checkIfInList());

  // Recheck list status when dependencies change
  useEffect(() => {
    setInList(checkIfInList());
  }, [item, category, tempLists, checkIfInList]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAddToList = () => {
    if (!item || !item.id) return;

    if (inList) {
      removeFromTempList(category, item.id);
      setInList(false);
    } else {
      // Normalize item shape for tempList storage
      const normalizedItem = {
        id: item.id,
        externalId: item.externalId || item.id,
        category: category,
        provider: item.provider || (category === "movie" || category === "tv" ? "tmdb" : null),
        name: item.name || item.title,
        image: item.image || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null),
        year: item.year || (item.release_date ? parseInt(item.release_date.split("-")[0]) : null) ||
              (item.first_air_date ? parseInt(item.first_air_date.split("-")[0]) : null),
        subtitle: item.subtitle || (item.vote_average ? `${item.vote_average.toFixed(1)} rating` : null),
        metadata: item.metadata || {
          overview: item.overview,
          voteAverage: item.vote_average,
        },
      };

      const success = addToTempList(category, normalizedItem);
      if (success) {
        setInList(true);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer text-sm sm:text-base"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back</span>
      </button>

      <Link
        href="/"
        className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer text-sm sm:text-base"
      >
        <HomeIcon className="h-5 w-5" />
        <span>Home</span>
      </Link>

      <button
        onClick={handleAddToList}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] rounded-lg transition-colors cursor-pointer text-sm sm:text-base ${
          inList
            ? "bg-green-600 text-white"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {inList ? (
          <>
            <CheckIcon className="h-5 w-5" />
            <span>Added to List</span>
          </>
        ) : (
          <>
            <PlusIcon className="h-5 w-5" />
            <span>Add to My List</span>
          </>
        )}
      </button>
    </div>
  );
}
