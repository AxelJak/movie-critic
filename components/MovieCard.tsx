import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Image from "next/image";
import Link from "next/link";
import {
  MoviesResponse,
  ReviewsResponse,
  MoviesRecord,
  UsersResponse,
} from "@/lib/api/pocketbase-types";
import { tmdbApi } from "@/lib/api/tmdb";
import { formatRuntime } from "@/lib/utils";

interface Expand {
  reviews_via_movie: ReviewsResponse<UserExpand>[];
}
interface UserExpand {
  user: UsersResponse;
}

interface MovieCardProps {
  movie: MoviesResponse<MoviesRecord, Expand>;
}

// Shimmer effect for loading placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default async function MovieCard({ movie }: MovieCardProps) {
  const siteRating =
    movie.expand?.reviews_via_movie?.length > 0
      ? movie.expand.reviews_via_movie.reduce(
        (sum, review) => sum + review.rating,
        0,
      ) / movie.expand!.reviews_via_movie!.length
      : 0;
  return (
    <Card className="overflow-hidden py-0 w-full">
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:h-auto flex-shrink-0 w-full sm:w-auto">
          <Link href={`/movie/${movie.tmdb_id}`} className="cursor-pointer block">
            <Image
              src={tmdbApi.getImageUrl(movie.poster_path, "w500") ?? ""}
              alt="movie_poster"
              height={500}
              width={333}
              className="object-cover hover:opacity-80 transition-opacity w-full sm:w-auto h-auto"
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(333, 500))}`}
            />
          </Link>
        </div>
        <div className="flex flex-col flex-1 py-2 sm:py-3">
          <CardHeader className="px-4 py-3 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">{movie.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                {movie.expand?.reviews_via_movie &&
                  movie.expand.reviews_via_movie.map((review) => (
                    <TabsTrigger key={review.id} value={`review-${review.id}`} className="text-xs sm:text-sm whitespace-nowrap">
                      {review.expand.user.name} {review.rating}
                    </TabsTrigger>
                  ))}
              </TabsList>
              <TabsContent value="overview" className="text-sm sm:text-base mt-3">{movie.overview}</TabsContent>
              {movie.expand?.reviews_via_movie &&
                movie.expand.reviews_via_movie.map((review) => (
                  <TabsContent key={review.id} value={`review-${review.id}`} className="text-sm sm:text-base mt-3">
                    {review.content}
                  </TabsContent>
                ))}
            </Tabs>
          </CardContent>
          <CardFooter className="mt-auto flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-around px-4 sm:px-6 pb-4 text-sm sm:text-base">
            <b>TMDB rating: {Math.round(movie.tmdb_rating * 10) / 10}</b>
            {movie.runtime && <b>Runtime: {formatRuntime(movie.runtime)}</b>}
            <b>Our rating: {Math.round(siteRating * 10) / 10}</b>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
