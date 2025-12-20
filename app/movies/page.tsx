import { tmdbApi } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import SearchBar from "@/components/SearchBar";
import MovieFilters from "@/components/MovieFilters";
import { TMDBMovie } from "@/lib/api/types";

type FilterType = "popular" | "now-playing" | "top-rated";

type SearchParams = {
  filter?: string;
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

async function getMovies(filter: FilterType) {
  switch (filter) {
    case "now-playing":
      return await tmdbApi.getNowPlayingMovies();
    case "top-rated":
      return await tmdbApi.getTopRatedMovies();
    case "popular":
    default:
      return await tmdbApi.getPopularMovies();
  }
}

export default async function MoviesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = (params.filter as FilterType) || "popular";

  // Validate filter
  const validFilter: FilterType = ["popular", "now-playing", "top-rated"].includes(filter)
    ? filter
    : "popular";

  const data = await getMovies(validFilter);
  const movies: TMDBMovie[] = data.results;

  return (
    <div className="flex min-h-svh flex-col items-center p-6 md:p-10">
      <div className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Movies</h1>
        <SearchBar />
      </div>

      <MovieFilters currentFilter={validFilter} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5 w-full max-w-7xl mt-8">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movie/${movie.id}`}>
            <Card className="h-full p-0 gap-0 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardTitle className="p-0">
                {movie.poster_path ? (
                  <Image
                    className="w-full h-auto object-cover"
                    src={
                      tmdbApi.getImageUrl(movie.poster_path, "w500") ||
                      "/placeholder.svg"
                    }
                    alt={movie.title}
                    width={500}
                    height={750}
                  />
                ) : (
                  <div className="w-full h-[250px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </CardTitle>
              <CardContent className="p-4">
                <div className="flex flex-row justify-between items-center">
                  <h2 className="text-xs font-bold line-clamp-1">
                    {movie.title}
                  </h2>
                  <div className="flex flex-row items-center">
                    <Star className="text-yellow-500 mr-1" size={16} />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
