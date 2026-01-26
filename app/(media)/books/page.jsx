// app/(media)/books/page.jsx
import { discover } from "@/library/api/providers";
import BooksList from "./BooksList";
import YearSelector from "@/components/ui/inputs/YearSelector";
import { parseYearValue } from "@/library/utils/yearUtils";
import { DEFAULT_YEAR } from "@/library/utils/defaults";
import Link from "next/link";
import { BookOpenIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

export const metadata = {
  title: "Books | Sortid",
  description: "Discover and add popular books to your lists",
};

export default async function BooksPage({ searchParams }) {
  const params = await searchParams;
  const selectedYear = params?.year || DEFAULT_YEAR;

  // Parse year value to handle decade ranges
  const { year, startYear, endYear, isDecade, label } = parseYearValue(selectedYear);

  // Fetch books using the unified provider interface
  const books = await discover("book", {
    year: isDecade ? `decade-${startYear}` : year,
    limit: 20,
  });

  // Display label for title
  const displayYear = isDecade ? label : selectedYear;

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Popular Books of {displayYear}</h1>
        <div className="w-full md:w-48">
          <YearSelector initialYear={selectedYear} />
        </div>
      </div>

      {books.length > 0 ? (
        <BooksList books={books} />
      ) : (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Books Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find any books for {displayYear}. Try a different year or search for specific titles.
            </p>
            <Link
              href={`/books?year=${selectedYear}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
