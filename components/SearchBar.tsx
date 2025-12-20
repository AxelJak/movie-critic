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

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
        setQuery("");
        setShowResults(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isExpanded]);

  // Focus input when expanded and prevent body scroll
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
      setQuery("");
      setShowResults(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleSearch}
        className="h-9 w-9"
        aria-label="Search movies"
      >
        <Search className="h-5 w-5" />
      </Button>

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 pt-16 md:pt-32"
          onClick={handleBackdropClick}
        >
          <div
            ref={searchRef}
            className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Search movies..."
                value={query}
                onChange={handleInputChange}
                className="w-full h-12 text-base pr-10 shadow-2xl"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSearch}
                className="absolute right-1 top-1 h-10 w-10"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {showResults && (results.length > 0 || isLoading) && (
              <Card className="mt-2 max-h-[60vh] overflow-auto shadow-2xl">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading...
                  </div>
                ) : (
                  <ul className="py-1">
                    {results.map((movie) => (
                      <li
                        key={movie.id}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3 transition-colors"
                        onClick={() => handleSelectMovie(movie.id)}
                      >
                        {movie.poster_path ? (
                          <div className="w-12 h-16 relative flex-shrink-0">
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
                          <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                            <span className="text-xs">No img</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-base">
                            {movie.title}
                          </div>
                          <div className="text-sm text-gray-500">
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
        </div>
      )}
    </>
  );
}
