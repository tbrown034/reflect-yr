"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/solid";
import AddToListButton from "@/components/ui/buttons/actions/AddToListButton";

export default function BookCard({ book }) {
  const [imageError, setImageError] = useState(false);

  // Extract the work ID from the full ID (e.g., "ol_OL45883W" -> "OL45883W")
  const workId = book.id?.replace("ol_", "") || book.externalId?.replace("/works/", "");

  // Get cover URL - book.image is already the full URL from the provider
  const coverUrl = book.image;
  const hasImage = coverUrl && !imageError;

  return (
    <li className="h-full">
      <Link href={`/books/${workId}`} className="block h-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md sm:shadow-xl overflow-hidden transition-all duration-300 hover:shadow-lg sm:hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 h-full flex flex-col relative">
          {/* Cover Image */}
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
            {hasImage ? (
              <Image
                src={coverUrl}
                alt={`${book.name} cover`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-green-600 dark:text-green-400 p-4">
                <BookOpenIcon className="h-12 w-12 mb-2 opacity-50" />
                <span className="text-xs text-center opacity-75 line-clamp-2">{book.name}</span>
              </div>
            )}

            {/* Year badge */}
            {book.year && (
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center bg-black/80 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg shadow-md">
                <span>{book.year}</span>
              </div>
            )}

            {/* Add to list button */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
              <AddToListButton itemType="book" item={book} />
            </div>
          </div>

          {/* Green accent bar */}
          <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600"></div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-5 grow flex flex-col bg-white dark:bg-gray-800">
            <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white line-clamp-2 mb-0.5 sm:mb-1">
              {book.name}
            </h3>
            {book.subtitle && (
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-1">
                {book.subtitle}
              </p>
            )}
            {book.metadata?.subjects?.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 grow">
                {book.metadata.subjects.slice(0, 3).join(", ")}
              </p>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
