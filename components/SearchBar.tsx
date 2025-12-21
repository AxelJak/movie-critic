"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { tmdbApi } from "@/lib/api/tmdb";
import { TMDBMovie } from "@/lib/api/types";
import { debounce } from "@/lib/utils";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const router = useRouter();

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
  }, []);

  // Keyboard shortcut to open search (⌘K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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

  const handleSearch = (value: string) => {
    setQuery(value);

    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setResults([]);
    }
  };

  const handleSelectMovie = (movieId: number) => {
    router.push(`/movie/${movieId}`);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setQuery("");
      setResults([]);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="gap-2 h-9 px-3"
        aria-label="Search movies"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
          </kbd>
        </span>
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange} shouldFilter={false}>
        <CommandInput
          placeholder="Search movies..."
          value={query}
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? "Loading..." : "No movies found."}
          </CommandEmpty>
          {results.map((movie) => (
            <CommandItem
              key={movie.id}
              value={movie.title}
              onSelect={() => handleSelectMovie(movie.id)}
              className="flex items-center gap-3 px-4 py-3"
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
                <div className="font-medium text-base">{movie.title}</div>
                <div className="text-sm text-gray-500">
                  {movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : "Unknown year"}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
