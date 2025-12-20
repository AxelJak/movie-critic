"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { tmdbApi } from "@/lib/api/tmdb";
import { TMDBMovie } from "@/lib/api/types";
import { Card } from "@/components/ui/card";
import { debounce } from "@/lib/utils";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close results and collapse when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsExpanded(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const searchMovies = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await tmdbApi.searchMovies(searchQuery);
      setResults(data.results.slice(0, 10)); // Limit to 10 results for autocomplete
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  const debouncedSearch = useRef(
    debounce((searchQuery) => {
      searchMovies(searchQuery as string);
    }, 300),
  ).current;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      setShowResults(true);
      debouncedSearch(value);
    } else {
      setShowResults(false);
      setResults([]);
    }
  };

  const handleSelectMovie = (movieId: number) => {
    router.push(`/movie/${movieId}`);
    setShowResults(false);
    setQuery("");
    setIsExpanded(false);
  };

  const handleToggleSearch = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setQuery("");
      setShowResults(false);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className="relative flex items-center" ref={searchRef}>
      {!isExpanded ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleSearch}
          className="h-9 w-9"
          aria-label="Search movies"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <div className="relative w-64 md:w-80">
          <Input
            ref={inputRef}
            placeholder="Search movies..."
            value={query}
            onChange={handleInputChange}
            className="w-full pr-8"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSearch}
            className="absolute right-0 top-0 h-full w-8"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </Button>

          {showResults && (results.length > 0 || isLoading) && (
            <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-auto shadow-lg">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : (
                <ul className="py-1">
                  {results.map((movie) => (
                    <li
                      key={movie.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                      onClick={() => handleSelectMovie(movie.id)}
                    >
                      {movie.poster_path ? (
                        <div className="w-10 h-14 relative flex-shrink-0">
                          <Image
                            src={
                              tmdbApi.getImageUrl(movie.poster_path, "w92") ||
                              "/placeholder.svg"
                            }
                            alt={movie.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{movie.title}</div>
                        <div className="text-xs text-gray-500">
                          {movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : "Unknown year"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
