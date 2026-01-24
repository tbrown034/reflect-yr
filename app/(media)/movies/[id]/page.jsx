import Image from "next/image";
import { notFound } from "next/navigation";
import {
  StarIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { getMovieById } from "@/library/api/tmdb";
import ActionButtons from "@/components/ui/buttons/actions/DetailPageActions";

export async function generateMetadata({ params }) {
  // In Next.js 15, params is a Promise that needs to be awaited
  const resolvedParams = await params;
  const movie = await getMovieById(resolvedParams.id);

  if (!movie) return { title: "Movie Not Found" };

  return {
    title: `${movie.title} (${
      movie.release_date?.substring(0, 4) || "Unknown"
    }) | Sortid`,
    description: movie.overview || "No description available",
  };
}

export default async function MovieDetailPage({ params }) {
  // In Next.js 15, params is a Promise that needs to be awaited
  const resolvedParams = await params;
  const movie = await getMovieById(resolvedParams.id);

  if (!movie) {
    notFound();
  }

  // Format release date
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown release date";

  // Calculate runtime in hours and minutes
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const formattedRuntime = movie.runtime
    ? `${hours}h ${minutes}m`
    : "Unknown runtime";

  // Get director
  const director =
    movie.credits?.crew?.find((person) => person.job === "Director")?.name ||
    "Unknown director";

  // Get top cast (first 5)
  const topCast = movie.credits?.cast?.slice(0, 5) || [];

  // Get genres as comma-separated string
  const genres =
    movie.genres?.map((genre) => genre.name).join(", ") || "Unknown genre";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Poster Section */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative w-full aspect-2/3 md:rounded-l-xl overflow-hidden">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={`${movie.title} poster`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
                  <span className="text-center p-4">No poster available</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {movie.title}
            </h1>

            {/* Year & Rating */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>{movie.release_date?.substring(0, 4) || "Unknown"}</span>
              </div>

              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                <span>
                  {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                </span>
              </div>

              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>{formattedRuntime}</span>
              </div>

              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>{director}</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {genres}
              </span>
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Overview
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {movie.overview || "No overview available."}
              </p>
            </div>

            {/* Cast Section */}
            {topCast.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Top Cast
                </h2>
                <div className="flex flex-wrap gap-2">
                  {topCast.map((actor) => (
                    <span
                      key={actor.id}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {actor.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <ActionButtons itemType="movie" item={movie} />
          </div>
        </div>
      </div>
    </div>
  );
}
