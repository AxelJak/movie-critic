"use client";
import { tmdbApi } from "@/lib/api";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import SearchBar from "@/components/SearchBar";
import { TMDBMovie } from "@/lib/api/types";

enum FetchOption {
  Popular = 1,
  NowPlaying,
  TopRated,
}

export default function Movies() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchOption, setFetchOption] = useState(FetchOption.Popular);

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setIsLoading(true);
        if (FetchOption.Popular === fetchOption) {
          const data = await tmdbApi.getPopularMovies();
          setMovies(data.results);
        } else if (FetchOption.NowPlaying === fetchOption) {
          const data = await tmdbApi.getNowPlayingMovies();
          setMovies(data.results);
        } else {
          const data = await tmdbApi.getTopRatedMovies();
          setMovies(data.results);
        }
      } catch (error) {
        console.error("Error fetching popular movies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularMovies();
  }, [fetchOption]);

  return (
    <div className="flex min-h-svh flex-col items-center p-6 md:p-10">
      <div className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Movies</h1>
        <SearchBar />
      </div>

      <div className="flex w-[50%] justify-between">
        <Button onClick={() => setFetchOption(FetchOption.Popular)}>
          Popular
        </Button>
        <Button onClick={() => setFetchOption(FetchOption.NowPlaying)}>
          Now Playing
        </Button>
        <Button onClick={() => setFetchOption(FetchOption.TopRated)}>
          Top Rated
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading movies...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5 w-full max-w-7xl">
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
      )}
    </div>
  );
}
