// app/(media)/tv/page.jsx
import { getTvShows } from "@/library/api/tmdb";
import TvShowsList from "./TvShowsList";
import YearSelector from "@/components/ui/inputs/YearSelector";
import { DEFAULT_YEAR } from "@/library/utils/defaults";
import Link from "next/link";
import { TvIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export default async function TvShowsPage({ searchParams }) {
  // Next.js 15: searchParams is now a Promise, must await it
  const params = await searchParams;
  const selectedYear = params?.year || DEFAULT_YEAR;

  // getTvShows already handles errors and returns []
  const tvShows = await getTvShows({
    year: selectedYear,
    sortBy: "popularity.desc",
    limit: 20,
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Top TV Shows of {selectedYear}</h1>
        <div className="w-full md:w-48">
          <YearSelector initialYear={selectedYear} />
        </div>
      </div>

      {tvShows.length > 0 ? (
        <TvShowsList shows={tvShows} />
      ) : (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TvIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No TV Shows Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find any TV shows for {selectedYear}. This might be a temporary issue.
            </p>
            <Link
              href={`/tv?year=${selectedYear}`}
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
