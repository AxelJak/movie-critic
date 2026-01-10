"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/use-auth";
import { pbApi } from "@/lib/api/pocketbase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListResult } from "pocketbase";
import ProfileEditor from "@/components/ProfileEditor";
import { MoviesRecord, ReviewsRecord } from "@/lib/api/pocketbase-types";

// Type for reviews with expanded movie data
type ReviewWithMovie = ReviewsRecord & {
  id: string;
  expand?: { movie?: MoviesRecord };
};
import { useRouter } from "next/navigation";
import { Star, Calendar, Film } from "lucide-react";

interface Stats {
  totalReviews: number;
  averageRating: number;
  genrePreferences: { name: string; count: number }[];
}

interface ProfileClientProps {
  initialReviews: ListResult<ReviewWithMovie>;
  initialStats: Stats;
}

export default function ProfileClient({
  initialReviews,
  initialStats,
}: ProfileClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] =
    useState<ListResult<ReviewWithMovie>>(initialReviews);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [stats, setStats] = useState(initialStats);

  const fetchUserReviews = async () => {
    try {
      const userReviews = await pbApi.getUserReviews();
      setReviews(userReviews as unknown as ListResult<ReviewWithMovie>);

      if (userReviews.items.length > 0) {
        const totalRating = userReviews.items.reduce(
          (sum, review) => sum + review.rating,
          0,
        );
        const average = totalRating / userReviews.items.length;

        const genreCounts = new Map<string, number>();
        const processedMovies = new Set<string>();
        const moviePromises = [];

        for (const review of userReviews.items) {
          if (!processedMovies.has(review.movie)) {
            processedMovies.add(review.movie);
            moviePromises.push(pbApi.getMovie(review.movie));
          }
        }

        const movies = await Promise.all(moviePromises);

        for (const movie of movies) {
          for (const genre of movie.genres || []) {
            const currentCount = genreCounts.get(genre.name) || 0;
            genreCounts.set(genre.name, currentCount + 1);
          }
        }

        const genrePrefs = Array.from(genreCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalReviews: userReviews.totalItems,
          averageRating: Number(average.toFixed(1)),
          genrePreferences: genrePrefs,
        });
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await pbApi.deleteReview(reviewId);
        await fetchUserReviews();
        router.refresh();
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  if (showProfileEditor) {
    return (
      <div className="container mx-auto p-4">
        <ProfileEditor
          onClose={() => {
            setShowProfileEditor(false);
            fetchUserReviews();
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          {user?.avatar ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-medium">
                {user?.name.charAt(0) || "?"}
              </span>
            </div>
          )}

          {/* User Info */}
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              Member since{" "}
              {new Date(user?.created || "").toLocaleDateString("sv")}
            </p>

            {/* Stats Summary */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-1">
                <Film className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{stats.totalReviews}</span>
                <span className="text-muted-foreground">reviews</span>
              </div>
              {stats.totalReviews > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{stats.averageRating}</span>
                  <span className="text-muted-foreground">avg rating</span>
                </div>
              )}
            </div>

            {/* Top Genres */}
            {stats.genrePreferences.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {stats.genrePreferences.slice(0, 3).map((genre, index) => (
                  <span
                    key={`${genre.name}-${index}`}
                    className="px-2 py-1 bg-muted rounded-full text-xs"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Edit Button */}
          <Button
            variant="outline"
            onClick={() => setShowProfileEditor(true)}
            className="flex-shrink-0"
          >
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Reviews Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Reviews</h2>

        {reviews.items.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="mb-4 text-muted-foreground">
              You haven&apos;t written any reviews yet.
            </p>
            <Button asChild>
              <Link href="/movies">Browse Movies</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.items.map((review) => {
              const movieData = review.expand?.movie;

              return (
                <Card
                  key={review.id}
                  className="p-4 flex flex-col md:flex-row gap-4"
                >
                  {movieData && movieData.poster_path ? (
                    <div className="flex-shrink-0">
                      <Link href={`/movie/${movieData.tmdb_id}`}>
                        <div className="relative w-20 h-30 rounded overflow-hidden">
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${movieData.poster_path}`}
                            alt={movieData.title}
                            width={80}
                            height={120}
                            className="object-cover rounded"
                          />
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-20 h-30 bg-muted rounded flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">
                        No image
                      </span>
                    </div>
                  )}

                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/movie/${movieData?.tmdb_id || review.movie}`}
                        >
                          <h3 className="font-bold hover:underline truncate">
                            {movieData?.title || "Movie"}
                          </h3>
                        </Link>
                        {review.title && (
                          <p className="text-sm font-medium text-muted-foreground truncate">
                            {review.title}
                          </p>
                        )}
                      </div>
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium flex-shrink-0">
                        {review.rating}/10
                      </div>
                    </div>

                    {review.content && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {review.content}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created || "").toLocaleDateString("sv")}
                      </span>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/movie/${movieData?.tmdb_id || review.movie}`}
                          >
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
