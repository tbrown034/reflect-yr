// app/lists/[type]/recommendations/[listId]/RecommendationsDisplay.jsx
"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ListContext } from "@/library/contexts/ListContext";

export default function RecommendationsDisplay({
  recommendations,
  listIsMovieType,
  onRemoveItem,
}) {
  const { isInList } = use(ListContext);
  const [removedItems, setRemovedItems] = useState({});

  // Handle removing a recommendation from the list
  const handleRemoveRecommendation = (recommendation) => {
    // Call the parent function to remove the item
    onRemoveItem(recommendation.id);

    // Track locally removed items
    setRemovedItems((prev) => ({
      ...prev,
      [recommendation.id]: true,
    }));
  };

  // Count remaining items
  const remainingCount = recommendations.filter(
    (rec) => !removedItems[rec.id]
  ).length;
  const totalCount = recommendations.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
          Here are personalized recommendations based on your list. You can
          remove any recommendations you don't like.
        </p>

        <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {remainingCount} of {totalCount} recommendations
        </span>
      </div>

      {remainingCount === 0 ? (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            You've removed all recommendations. Click "Regenerate
            Recommendations" to get new suggestions.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {recommendations.map((rec) => {
            // Skip removed items
            if (removedItems[rec.id]) return null;

            // Get title/name based on type
            const title = listIsMovieType ? rec.title : rec.name;

            // Get year from release_date or first_air_date
            const year = listIsMovieType
              ? rec.release_date
                ? new Date(rec.release_date).getFullYear()
                : rec.year || "Unknown"
              : rec.first_air_date
              ? new Date(rec.first_air_date).getFullYear()
              : rec.year || "Unknown";

            // Get poster path if it exists
            const posterPath = rec.poster_path
              ? `https://image.tmdb.org/t/p/w92${rec.poster_path}`
              : null;

            // Get reason (either from recommendation or default)
            const reason = rec.reason || "Based on your list preferences";

            // Check if item is already in the user's list
            const itemId = rec.id?.toString();
            const isInUserList = isInList(
              listIsMovieType ? "movie" : "tv",
              itemId
            );

            // Determine the detail page URL
            const detailPath = `/${listIsMovieType ? "movies" : "tv"}/${
              rec.id
            }`;

            return (
              <li
                key={rec.id || `rec_${title}`}
                className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {/* Poster image or placeholder */}
                <div className="shrink-0 w-full md:w-20 h-28 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                  {posterPath ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={posterPath}
                        alt={`${title} poster`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-sm text-center px-2">
                        No Image
                      </span>
                    </div>
                  )}
                </div>

                <div className="grow">
                  {/* Title & Year */}
                  <div className="flex justify-between">
                    <Link href={detailPath} className="hover:underline">
                      <h3 className="text-lg font-semibold">{title}</h3>
                    </Link>
                    <span className="text-gray-500">{year}</span>
                  </div>

                  {/* Rating if available */}
                  {rec.vote_average > 0 && (
                    <div className="flex items-center mt-1">
                      <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {rec.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Already in list indicator */}
                  {isInUserList && (
                    <div className="mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">
                        Already in your list
                      </span>
                    </div>
                  )}

                  {/* Reason */}
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {reason}
                  </p>

                  {/* Remove button */}
                  <div className="mt-3">
                    <button
                      onClick={() => handleRemoveRecommendation(rec)}
                      className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
