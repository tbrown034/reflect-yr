"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import AddToListButton from "@/components/ui/buttons/actions/AddToListButton";
import { use } from "react";
import { ListContext } from "@/library/contexts/ListContext";

export default function MovieCard({ movie }) {
  const [imageError, setImageError] = useState(false);
  const { isInList } = use(ListContext);

  const handleImageError = () => {
    setImageError(true);
  };

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder-movie.jpg";

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Unknown";

  return (
    <li className="h-full">
      <Link href={`/movies/${movie.id}`} className="block h-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col relative">
          <div className="relative aspect-2/3 w-full overflow-hidden">
            <Image
              src={imageError ? "/placeholder-movie.jpg" : posterUrl}
              alt={`${movie.title} poster`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
              onError={handleImageError}
            />

            <div className="absolute top-3 left-3 flex items-center bg-black/80 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
              <StarIcon className="h-4 w-4 text-yellow-400 mr-1.5" />
              <span>
                {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <AddToListButton itemType="movie" item={movie} />
            </div>
          </div>

          <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-blue-600 to-purple-600"></div>

          <div className="p-5 grow flex flex-col bg-white dark:bg-gray-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-1">
              {movie.title}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {year}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 grow">
              {movie.overview || "No overview available."}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
