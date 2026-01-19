// components/layout/hero/scrollingMedia/ScrollingMovies.jsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { getMovies } from "@/library/api/tmdb";

export default async function ScrollingMovies({ year = "2025" }) {
  let movies = [];

  try {
    movies = await getMovies({
      year,
      sortBy: "vote_count.desc",
      limit: 15,
      includeAdult: false,
    });
  } catch (error) {
    console.error("Error fetching movies for scrolling:", error);
  }

  if (movies.length === 0) {
    return (
      <div className="w-full px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Popular Movies of{" "}
            <span className="text-yellow-500 dark:text-yellow-400">{year}</span>
          </h2>
          <Link
            href={`/movies?year=${year}`}
            className="text-sm font-medium text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            View All
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
          <p className="text-slate-600 dark:text-slate-400">
            No movies available for {year}
          </p>
        </div>
      </div>
    );
  }

  const doubledMovies = [...movies, ...movies];

  return (
    <div className="w-full px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Popular Movies{" "}
          <span className="text-yellow-500 dark:text-yellow-400">{year}</span>
        </h2>
        <Link
          href={`/movies?year=${year}`}
          className="text-sm font-medium text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          View All
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Container with overflow hidden - Add pause-on-hover functionality */}
      <div className="relative overflow-hidden rounded-xl group">
        {/* Inner content that scrolls - pauses on hover */}
        <div className="flex animate-scrollLeft gap-4 w-max py-4 group-hover:pause transition-all duration-300">
          {doubledMovies.map((movie, index) => (
            <Link
              key={`${movie.id}-${index}`}
              href={`/movies/${movie.id}`}
              className="shrink-0 w-28 sm:w-36 transition-transform hover:scale-105 cursor-pointer"
            >
              <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                      : "/placeholder-movie.jpg"
                  }
                  alt={`Poster of ${movie.title}`}
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
