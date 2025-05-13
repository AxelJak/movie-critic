import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Image from "next/image";
import { Movie, Review } from "@/lib/api";
import { tmdbApi } from "@/lib/api/tmdb";

interface MovieCardProps {
  reviews: Review[];
}

export default async function MovieCard({ reviews }: MovieCardProps) {
  const movie = await tmdbApi.getMovieDetails(parseInt(reviews[0].movie));

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
                {reviews &&
                  reviews.map((review: Review) => (
                    <TabsTrigger key={review.id} value={`review-${review.id}`}>
                      {review.user}
                    </TabsTrigger>
                  ))}
              </TabsList>
              <TabsContent value="overview">{movie.overview}</TabsContent>
              {reviews &&
                reviews.map((review: Review) => (
                  <TabsContent key={review.id} value={`review-${review.id}`}>
                    {review.content}
                  </TabsContent>
                ))}
            </Tabs>
          </CardContent>
          <CardFooter className="mt-auto">
            {" "}
            <b>TMDB rating: {Math.round(movie.vote_average * 10) / 10}</b>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
