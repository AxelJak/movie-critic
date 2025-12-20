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

interface Expand {
  reviews_via_movie: ReviewsResponse<UserExpand>[];
}
interface UserExpand {
  user: UsersResponse;
}

interface MovieCardProps {
  movie: MoviesResponse<MoviesRecord, Expand>;
}

export default async function MovieCard({ movie }: MovieCardProps) {
  const siteRating =
    movie.expand.reviews_via_movie.length > 0
      ? movie.expand.reviews_via_movie.reduce(
          (sum, review) => sum + review.rating,
          0,
        ) / movie.expand.reviews_via_movie.length
      : 0;
  return (
    <Card className="overflow-hidden py-0 w-full">
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:h-auto flex-shrink-0 w-full sm:w-auto">
          <Link href={`/movie/${movie.tmdb_id}`} className="cursor-pointer block">
            <Image
              src={tmdbApi.getImageUrl(movie.poster_path, "w200") ?? ""}
              alt="movie_poster"
              height={250}
              width={125}
              className="object-cover hover:opacity-80 transition-opacity w-full sm:w-auto h-auto"
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
                {movie.expand.reviews_via_movie &&
                  movie.expand.reviews_via_movie.map((review) => (
                    <TabsTrigger key={review.id} value={`review-${review.id}`} className="text-xs sm:text-sm whitespace-nowrap">
                      {review.expand.user.name} {review.rating}
                    </TabsTrigger>
                  ))}
              </TabsList>
              <TabsContent value="overview" className="text-sm sm:text-base mt-3">{movie.overview}</TabsContent>
              {movie.expand.reviews_via_movie &&
                movie.expand.reviews_via_movie.map((review) => (
                  <TabsContent key={review.id} value={`review-${review.id}`} className="text-sm sm:text-base mt-3">
                    {review.content}
                  </TabsContent>
                ))}
            </Tabs>
          </CardContent>
          <CardFooter className="mt-auto flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-around px-4 sm:px-6 pb-4 text-sm sm:text-base">
            <b>TMDB rating: {Math.round(movie.tmdb_rating * 10) / 10}</b>
            <b>Our rating: {Math.round(siteRating * 10) / 10}</b>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
