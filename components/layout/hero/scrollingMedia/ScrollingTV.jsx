// components/layout/hero/scrollingMedia/ScrollingTV.jsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { getTvShows } from "@/library/api/tmdb";

export default async function ScrollingTV({ year = "2025" }) {
  let tvShows = [];

  try {
    tvShows = await getTvShows({
      year,
      sortBy: "vote_count.desc",
      limit: 15,
      includeAdult: false,
    });
  } catch (error) {
    console.error("Error fetching TV shows for scrolling:", error);
  }

  if (tvShows.length === 0) {
    return (
      <div className="w-full px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Popular TV Shows of{" "}
            <span className="text-yellow-500 dark:text-yellow-400">{year}</span>
          </h2>
          <Link
            href={`/tv?year=${year}`}
            className="text-sm font-medium text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            View All
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
          <p className="text-slate-600 dark:text-slate-400">
            No TV shows available for {year}
          </p>
        </div>
      </div>
    );
  }

  const doubledShows = [...tvShows, ...tvShows];

  return (
    <div className="w-full px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Popular TV Shows{" "}
          <span className="text-yellow-500 dark:text-yellow-400">{year}</span>
        </h2>
        <Link
          href={`/tv?year=${year}`}
          className="text-sm font-medium text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          View All
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Container with overflow hidden - Add pause-on-hover functionality */}
      <div className="relative overflow-hidden rounded-xl group">
        {/* Inner content that scrolls - pauses on hover */}
        <div className="flex animate-scrollRight gap-4 w-max py-4 group-hover:pause transition-all duration-300">
          {doubledShows.map((show, index) => (
            <Link
              key={`${show.id}-${index}`}
              href={`/tv/${show.id}`}
              className="shrink-0 w-28 sm:w-36 transition-transform hover:scale-105 cursor-pointer"
            >
              <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={
                    show.poster_path
                      ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                      : "/placeholder-tv.jpg"
                  }
                  alt={`Poster of ${show.name}`}
                  fill
                  sizes="(max-width: 640px) 112px, 144px"
                  className="object-cover"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
