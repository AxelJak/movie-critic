import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Image from "next/image";
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
    <Card className="overflow-hidden py-0">
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:h-auto flex-shrink-0">
          <Image
            src={tmdbApi.getImageUrl(movie.poster_path, "w200") ?? ""}
            alt="movie_poster"
            height={250}
            width={125}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col flex-1 py-3">
          <CardHeader>
            <CardTitle>{movie.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {movie.expand.reviews_via_movie &&
                  movie.expand.reviews_via_movie.map((review) => (
                    <TabsTrigger key={review.id} value={`review-${review.id}`}>
                      {review.expand.user.name} {review.rating}
                    </TabsTrigger>
                  ))}
              </TabsList>
              <TabsContent value="overview">{movie.overview}</TabsContent>
              {movie.expand.reviews_via_movie &&
                movie.expand.reviews_via_movie.map((review) => (
                  <TabsContent key={review.id} value={`review-${review.id}`}>
                    {review.content}
                  </TabsContent>
                ))}
            </Tabs>
          </CardContent>
          <CardFooter className="mt-auto flex justify-around">
            <b>TMDB rating: {Math.round(movie.tmdb_rating * 10) / 10}</b>
            <b>Our rating: {Math.round(siteRating * 10) / 10}</b>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
