// app/lists/[type]/saved-recommendations/[listId]/page.jsx
"use client";

import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  StarIcon,
  TrashIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { ListContext } from "@/library/contexts/ListContext";

export default function SavedRecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const { getRecommendationList, deleteRecommendationList, getPublishedList } =
    use(ListContext);

  const [list, setList] = useState(null);
  const [sourceList, setSourceList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  // Extract and validate route parameters
  const type = params?.type;
  const listId = params?.listId;
  const isValidType = type === "movies" || type === "tv";
  const pageTypeLabel = type === "movies" ? "Movie" : "TV Show";

  useEffect(() => {
    if (!isValidType || !listId) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    const recommendationList = getRecommendationList(listId);
    if (!recommendationList) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    setList(recommendationList);

    // Get the source list if available
    if (recommendationList.sourceListId) {
      const source = getPublishedList(recommendationList.sourceListId);
      if (source) {
        setSourceList(source);
      }
    }

    setIsLoading(false);
  }, [getRecommendationList, getPublishedList, listId, isValidType]);

  const handleDeleteList = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this recommendation list?"
      )
    ) {
      deleteRecommendationList(listId);
      router.push("/lists");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <p className="text-lg animate-pulse text-gray-600 dark:text-gray-400">
          Loading recommendation list...
        </p>
      </div>
    );
  }

  if (isNotFound || !list) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">
          Recommendation List Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The requested recommendation list could not be found or its type
          doesn't match the URL.
        </p>
        <Link
          href="/lists"
          className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to My Lists</span>
        </Link>
      </div>
    );
  }

  // Determine media type specific properties
  const listIsMovieType = list.type === "movie";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 bg-linear-to-r from-purple-500 to-blue-500">
          <h1 className="text-3xl font-bold text-white mb-2">{list.title}</h1>
          {sourceList && (
            <div className="text-white opacity-90">
              Based on:{" "}
              <Link
                href={`/lists/${type}/publish/${sourceList.id}`}
                className="underline hover:text-blue-100"
              >
                {sourceList.title}
              </Link>
            </div>
          )}
          <p className="text-white opacity-75 mt-2">
            Saved on {new Date(list.savedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Recommendations List */}
        <div className="p-6">
          {list.items && list.items.length > 0 ? (
            <ul className="space-y-4">
              {list.items.map((item) => {
                // Get title/name based on type
                const title = listIsMovieType ? item.title : item.name;

                // Get year from release_date or first_air_date
                const year = listIsMovieType
                  ? item.release_date
                    ? new Date(item.release_date).getFullYear()
                    : item.year || "Unknown"
                  : item.first_air_date
                  ? new Date(item.first_air_date).getFullYear()
                  : item.year || "Unknown";

                // Get poster path if it exists
                const posterPath = item.poster_path
                  ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                  : null;

                // Get reason (either from recommendation or default)
                const reason = item.reason || "Based on your list preferences";

                // Determine the detail page URL
                const detailPath = `/${listIsMovieType ? "movies" : "tv"}/${
                  item.id
                }`;

                return (
                  <li
                    key={item.id || `rec_${title}`}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {/* Poster image or placeholder */}
                    <div className="shrink-0 w-full md:w-20 h-28 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                      {posterPath ? (
                        <Link href={detailPath}>
                          <div className="relative w-full h-full">
                            <Image
                              src={posterPath}
                              alt={`${title} poster`}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        </Link>
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
                      {item.vote_average > 0 && (
                        <div className="flex items-center mt-1">
                          <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {item.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Reason */}
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {reason}
                      </p>

                      {/* View Details Button */}
                      <div className="mt-3">
                        <Link
                          href={detailPath}
                          className="px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                        >
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              This recommendation list is empty.
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Back to Lists Button */}
            <Link
              href="/lists"
              className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base"
            >
              <ArrowLeftIcon className="h-5 w-5 shrink-0" />
              <span>Back to Lists</span>
            </Link>

            {/* Generate New Recommendations (if source list exists) */}
            {sourceList && (
              <Link
                href={`/lists/${type}/recommendations/${sourceList.id}`}
                className="inline-flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors text-sm sm:text-base"
              >
                <SparklesIcon className="h-5 w-5 shrink-0" />
                <span>Generate New Recommendations</span>
              </Link>
            )}

            {/* Delete List Button */}
            <button
              onClick={handleDeleteList}
              className="inline-flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-sm sm:text-base ml-auto"
            >
              <TrashIcon className="h-5 w-5 shrink-0" />
              <span>Delete List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
