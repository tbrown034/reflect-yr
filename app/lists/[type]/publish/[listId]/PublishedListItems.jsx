// app/lists/[type]/publish/[listId]/PublishedListItems.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

export default function PublishedListItems({
  items, // The array of items
  listIsMovieType, // Boolean: true if items are movies
  onMoveUp, // Function to move item up (itemId) => void
  onMoveDown, // Function to move item down (itemId) => void
  onRemove, // Function to remove item (itemId) => void
}) {
  const [removedItemId, setRemovedItemId] = useState(null);
  const [itemAnimation, setItemAnimation] = useState({ id: null, type: null });

  const handleMoveUp = (itemId) => {
    setItemAnimation({ id: itemId, type: "up" });
    onMoveUp(itemId);
    setTimeout(() => setItemAnimation({ id: null, type: null }), 300);
  };

  const handleMoveDown = (itemId) => {
    setItemAnimation({ id: itemId, type: "down" });
    onMoveDown(itemId);
    setTimeout(() => setItemAnimation({ id: null, type: null }), 300);
  };

  const handleRemove = (itemId) => {
    setRemovedItemId(itemId);
    setTimeout(() => {
      onRemove(itemId);
      setRemovedItemId(null);
    }, 300);
  };

  if (!items || items.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
        This list is empty. Add some items!
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        // Logic previously in PublishedListItem is now inline
        const title = listIsMovieType ? item.title : item.name;
        const year = listIsMovieType
          ? item.release_date
            ? new Date(item.release_date).getFullYear()
            : "N/A"
          : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : "N/A";
        const posterPath = item.poster_path
          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
          : "/placeholder-movie.jpg";
        const detailPath = `/${listIsMovieType ? "movies" : "tv"}/${item.id}`;
        const isFirstItem = index === 0;
        const isLastItem = index === items.length - 1;

        return (
          <li
            key={item.id}
            className={`flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm
              transition-all duration-300
              ${
                removedItemId === item.id
                  ? "opacity-0 transform translate-x-full"
                  : "opacity-100"
              }
              ${
                itemAnimation.id === item.id && itemAnimation.type === "up"
                  ? "transform -translate-y-2"
                  : ""
              }
              ${
                itemAnimation.id === item.id && itemAnimation.type === "down"
                  ? "transform translate-y-2"
                  : ""
              }
            `}
          >
            {/* Rank */}
            <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 font-semibold text-blue-800 dark:text-blue-100">
              {index + 1}
            </div>

            {/* Item Info Link */}
            <Link
              href={detailPath}
              className="flex items-center grow min-w-0 group mr-2 cursor-pointer"
              title={`View details for ${title}`}
            >
              <div className="shrink-0 w-10 h-14 relative mr-3 bg-gray-200 dark:bg-gray-600 rounded">
                <Image
                  src={posterPath}
                  alt={`${title} poster`}
                  fill
                  sizes="40px"
                  className="object-cover rounded cursor-pointer"
                  unoptimized={posterPath === "/placeholder-movie.jpg"}
                  onError={(e) => {
                    e.target.src = "/placeholder-movie.jpg";
                  }}
                />
              </div>
              <div className="grow min-w-0">
                <p className="font-medium truncate group-hover:underline">
                  {title}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{year}</span>
                  {item.userRating && (
                    <span className="flex items-center gap-0.5">
                      {[...Array(item.userRating)].map((_, i) => (
                        <StarIcon key={i} className="h-3.5 w-3.5 text-yellow-400" />
                      ))}
                    </span>
                  )}
                </div>
                {item.comment && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic truncate">
                    "{item.comment}"
                  </p>
                )}
              </div>
            </Link>

            {/* Action Buttons */}
            <div className="shrink-0 flex items-center space-x-1">
              {/* Reorder Buttons */}
              <div className="flex flex-col">
                {!isFirstItem && (
                  <button
                    onClick={() => handleMoveUp(item.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                    title="Move up"
                  >
                    <ChevronUpIcon className="h-5 w-5" />
                  </button>
                )}
                {!isLastItem && (
                  <button
                    onClick={() => handleMoveDown(item.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                    title="Move down"
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              {/* Delete Button */}
              <button
                onClick={() => handleRemove(item.id)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
                title="Remove from list"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
