// app/(media)/movies/page.jsx
import { getMovies } from "@/library/api/tmdb";
import MoviesList from "./MoviesList";
import YearSelector from "@/components/ui/inputs/YearSelector";
import { parseYearValue } from "@/library/utils/yearUtils";
import { DEFAULT_YEAR } from "@/library/utils/defaults";
import Link from "next/link";
import { FilmIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export const metadata = {
  title: "Browse Movies | sort(id)",
  description: "Discover popular movies by year and decade. Create ranked lists of your favorite films.",
};

export default async function MoviesPage({ searchParams }) {
  // Next.js 15: searchParams is now a Promise, must await it
  const params = await searchParams;
  const selectedYear = params?.year || DEFAULT_YEAR;

  // Parse year value to handle decade ranges
  const { year, startYear, endYear, isDecade, label } = parseYearValue(selectedYear);

  // Fetch data with the year - getMovies already handles errors and returns []
  const movies = await getMovies({
    year: isDecade ? null : year,
    startYear: isDecade ? startYear : null,
    endYear: isDecade ? endYear : null,
    sortBy: "popularity.desc",
    limit: 20,
  });

  // Display label for title
  const displayYear = isDecade ? label : selectedYear;

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Top Movies of {displayYear}</h1>
        <div className="w-full md:w-48">
          <YearSelector initialYear={selectedYear} />
        </div>
      </div>

      {movies.length > 0 ? (
        <MoviesList movies={movies} />
      ) : (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FilmIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Movies Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find any movies for {displayYear}. This might be a temporary issue.
            </p>
            <Link
              href={`/movies?year=${selectedYear}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Try Again
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
