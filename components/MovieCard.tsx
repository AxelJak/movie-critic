import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Review } from "@/lib/api";

interface MovieCardProps {
  title: string;
  poster: string;
  rating: number;
  reviews: Review[];
}

export default function MovieCard({
  title,
  poster,
  rating,
  reviews,
}: MovieCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-[200px] w-full sm:h-auto sm:w-[200px] flex-shrink-0">
          <Image
            src={poster || "/placeholder.svg"}
            alt="movie_poster"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col flex-1">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-[400px]">
              <TabsList>
                {reviews.map((review: Review) => (
                  <TabsTrigger key={review.id} value={`review-${review.id}`}>
                    {review.user}
                  </TabsTrigger>
                ))}
              </TabsList>
              {reviews.map((review: Review) => (
                <TabsContent key={review.id} value={`review-${review.id}`}>
                  {review.content}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
          <CardFooter className="mt-auto">
            {rating}
            <Button></Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
