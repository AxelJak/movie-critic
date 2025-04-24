"use client";
import { tmdbApi } from "@/lib/api";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardTitle, CardContent, CardAction } from "@/components/ui/card";

export default function Movies() {
  const [searchResults, setSearchResults] = useState<any>();
  const [query, setQuery] = useState("");

  const searchTMDB = async () => {
    const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`;
    try {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        },
      };
      const response = await fetch(url, options);
      const data = await response.json();
      const result = data.results.sort(
        (a: any, b: any) => b.vote_count - a.vote_count,
      );
      setSearchResults(result);
    } catch (error) {
      console.error("Error searching TMDB:", error);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="flex flex-row mb-6">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button onClick={() => searchTMDB()}>Search</Button>
      </div>
      {searchResults && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((movie: any) => (
            <Card key={movie.id} className="w-[300px] pt-0">
              <CardTitle>
                <Image
                  className="rounded-t-2xl"
                  src={
                    tmdbApi.getImageUrl(movie.poster_path, "w300") ??
                    "/placeholder.svg"
                  }
                  alt={movie.title}
                  width={300}
                  height={400}
                />
              </CardTitle>
              <CardContent>
                <div className="flex flex-row justify-between">
                  <h2 className="text-lg font-bold">{movie.title}</h2>
                  <div className="flex flex-row items-center">
                    <Star size={15} /> {movie.vote_average}
                  </div>
                </div>
                <p>{movie.overview}</p>
              </CardContent>
              <CardAction>
                <Button>Watch Now</Button>
              </CardAction>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
