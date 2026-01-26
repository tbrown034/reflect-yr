import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BookOpenIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { getById } from "@/library/api/providers";
import ActionButtons from "@/components/ui/buttons/actions/DetailPageActions";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const book = await getById(resolvedParams.id, "book");

  if (!book) return { title: "Book Not Found" };

  return {
    title: `${book.name} ${book.year ? `(${book.year})` : ""} | Sortid`,
    description: book.metadata?.subjects?.slice(0, 5).join(", ") || "No description available",
  };
}

export default async function BookDetailPage({ params }) {
  const resolvedParams = await params;
  const book = await getById(resolvedParams.id, "book");

  if (!book) {
    notFound();
  }

  // Get authors list
  const authors = book.metadata?.authors || [];
  const authorsText = authors.length > 0 ? authors.join(", ") : book.subtitle || "Unknown author";

  // Get subjects/genres
  const subjects = book.metadata?.subjects || [];

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Cover Section */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative w-full aspect-[2/3] md:rounded-l-xl overflow-hidden bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
              {book.image ? (
                <Image
                  src={book.image}
                  alt={`${book.name} cover`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-green-600 dark:text-green-400 p-8">
                  <BookOpenIcon className="h-24 w-24 mb-4 opacity-50" />
                  <span className="text-lg text-center opacity-75">{book.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-2/3 lg:w-3/4 p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {book.name}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-gray-600 dark:text-gray-300">
              {book.year && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1" />
                  <span className="text-sm sm:text-base">{book.year}</span>
                </div>
              )}

              <div className="flex items-center">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1" />
                <span className="text-sm sm:text-base">{authorsText}</span>
              </div>

              {book.metadata?.editionCount && (
                <div className="flex items-center">
                  <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1" />
                  <span className="text-sm sm:text-base">{book.metadata.editionCount} editions</span>
                </div>
              )}
            </div>

            {/* Subjects/Genres */}
            {subjects.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                  <TagIcon className="h-5 w-5 text-green-500" />
                  Subjects
                </h2>
                <div className="flex flex-wrap gap-2">
                  {subjects.slice(0, 10).map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs sm:text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {book.metadata?.languages?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Available Languages
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {book.metadata.languages.slice(0, 5).join(", ")}
                </p>
              </div>
            )}

            {/* Open Library Link */}
            {book.externalId && (
              <div className="mb-6">
                <a
                  href={`https://openlibrary.org${book.externalId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm sm:text-base underline"
                >
                  View on Open Library
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <ActionButtons itemType="book" item={book} />
          </div>
        </div>
      </div>
    </div>
  );
}
