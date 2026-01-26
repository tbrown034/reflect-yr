"use client";

import { useState, useEffect, useCallback, use } from "react";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/solid";
import { ListContext } from "@/library/contexts/ListContext";

/**
 * AddToListButton - Adds/removes items from staging (tempLists)
 * Supports all categories: movie, tv, book, podcast, custom
 *
 * @param {string} itemType - Category: "movie", "tv", "book", "podcast", "tv show" (normalized to "tv")
 * @param {object} item - Media item with id, name/title, image/poster_path, year, etc.
 * @param {string} className - Additional CSS classes
 */
export default function AddToListButton({ itemType, item, className = "" }) {
  const { isInTempList, addToTempList, removeFromTempList, tempLists } =
    use(ListContext);

  // Normalize category name (handle "tv show" -> "tv")
  const category = itemType === "tv show" ? "tv" : itemType;

  // Check if item is in the staging list
  const checkIfInList = useCallback(() => {
    if (!item || !item.id) {
      return false;
    }
    return isInTempList(category, item.id);
  }, [item, category, isInTempList]);

  const [isCurrentlyInList, setIsCurrentlyInList] = useState(checkIfInList());

  // Recheck list status when relevant dependencies change
  useEffect(() => {
    setIsCurrentlyInList(checkIfInList());
  }, [item, category, tempLists, checkIfInList]);

  const handleToggleList = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!item || !item.id) {
      console.error("[AddToListButton] Cannot add/remove - no item or no item.id");
      return;
    }

    if (isCurrentlyInList) {
      removeFromTempList(category, item.id);
      setIsCurrentlyInList(false);
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
        setIsCurrentlyInList(true);
      }
    }
  };

  if (!item) return null;

  return (
    <button
      onClick={handleToggleList}
      aria-label={isCurrentlyInList ? `Remove from list` : `Add to list`}
      className={`p-3 sm:p-2.5 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 ${
        isCurrentlyInList
          ? "bg-green-600 hover:bg-green-700"
          : "bg-blue-600 hover:bg-blue-700"
      } text-white ${className}`}
      data-in-list={isCurrentlyInList}
    >
      {isCurrentlyInList ? (
        <CheckIcon className="h-5 w-5 sm:h-4 sm:w-4" />
      ) : (
        <PlusIcon className="h-5 w-5 sm:h-4 sm:w-4" />
      )}
    </button>
  );
}
