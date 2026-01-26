// app/lists/[type]/recommendations/[listId]/RecommendationsDisplay.jsx
"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, XMarkIcon, FilmIcon, TvIcon } from "@heroicons/react/24/solid";
import { ListContext } from "@/library/contexts/ListContext";

export default function RecommendationsDisplay({
  recommendations,
  listIsMovieType,
  onRemoveItem,
}) {
  const { isInList } = use(ListContext);
  const [removedItems, setRemovedItems] = useState({});

  const handleRemoveRecommendation = (recommendation) => {
    onRemoveItem(recommendation.id);
    setRemovedItems((prev) => ({
      ...prev,
      [recommendation.id]: true,
    }));
  };

  const remainingCount = recommendations.filter(
    (rec) => !removedItems[rec.id]
  ).length;
  const totalCount = recommendations.length;

  const FallbackIcon = listIsMovieType ? FilmIcon : TvIcon;

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Personalized picks based on your list
        </p>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {remainingCount} of {totalCount}
        </span>
      </div>

      {remainingCount === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">
            No recommendations left. Try regenerating.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => {
            if (removedItems[rec.id]) return null;

            const title = listIsMovieType ? rec.title : rec.name;
            const year = listIsMovieType
              ? rec.release_date?.split("-")[0]
              : rec.first_air_date?.split("-")[0];
            const posterPath = rec.poster_path
              ? `https://image.tmdb.org/t/p/w200${rec.poster_path}`
              : null;
            const reason = rec.reason || "Matches your taste";
            const itemId = rec.id?.toString();
            const isInUserList = isInList(
              listIsMovieType ? "movie" : "tv",
              itemId
            );
            const detailPath = `/${listIsMovieType ? "movies" : "tv"}/${rec.id}`;

            return (
              <div
                key={rec.id || `rec_${title}`}
                className="flex gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group"
              >
                {/* Poster */}
                <Link href={detailPath} className="shrink-0">
                  <div className="w-14 h-20 rounded overflow-hidden bg-slate-100 dark:bg-slate-700">
                    {posterPath ? (
                      <Image
                        src={posterPath}
                        alt=""
                        width={56}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FallbackIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={detailPath} className="hover:underline">
                        <h3 className="font-medium text-slate-900 dark:text-white truncate">
                          {title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {year && (
                          <span className="text-xs text-slate-500">{year}</span>
                        )}
                        {rec.vote_average > 0 && (
                          <span className="flex items-center text-xs text-slate-500">
                            <StarIcon className="h-3 w-3 text-amber-400 mr-0.5" />
                            {rec.vote_average.toFixed(1)}
                          </span>
                        )}
                        {isInUserList && (
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded">
                            In list
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveRecommendation(rec)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
