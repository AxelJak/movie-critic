import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileClient from "@/components/ProfileClient";
import { getPocketBaseServer } from "@/lib/api/pocketbase-server";
import { ListResult } from "pocketbase";
import { MoviesRecord, ReviewsResponse, MovieGenresRecord } from "@/lib/api/pocketbase-types";

interface Stats {
  totalReviews: number;
  averageRating: number;
  genrePreferences: { name: string; count: number }[];
}

async function getUserReviewsAndStats(): Promise<{
  reviews: ListResult<ReviewsResponse<MoviesRecord>>;
  stats: Stats;
}> {
  const pb = await getPocketBaseServer();

  if (!pb.authStore.isValid) {
    throw new Error("Not authenticated");
  }

  const userId = pb.authStore.record?.id;

  // Fetch user reviews with expanded movie data
  const reviews = await pb
    .collection("reviews")
    .getList<ReviewsResponse<MoviesRecord>>(1, 20, {
      expand: "movie",
      filter: `user="${userId}"`,
      sort: "-created",
    });

  // Calculate stats
  let stats: Stats = {
    totalReviews: 0,
    averageRating: 0,
    genrePreferences: [],
  };

  if (reviews.items.length > 0) {
    const totalRating = reviews.items.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    const average = totalRating / reviews.items.length;

    const genreCounts = new Map<string, number>();

    for (const review of reviews.items) {
      // Use the already-expanded movie data
      const movie = review.expand?.movie;
      if (movie) {
        const genres = movie.genres as unknown as MovieGenresRecord[] || [];
        for (const genre of genres) {
          const currentCount = genreCounts.get(genre.name) || 0;
          genreCounts.set(genre.name, currentCount + 1);
        }
      }
    }

    const genrePrefs = Array.from(genreCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    stats = {
      totalReviews: reviews.totalItems,
      averageRating: Number(average.toFixed(1)),
      genrePreferences: genrePrefs,
    };
  }

  return { reviews, stats };
}

export default async function ProfilePage() {
  const pb = await getPocketBaseServer();

  // Check if user is authenticated
  if (!pb.authStore.isValid) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <Card className="p-6 w-full max-w-md">
          <p className="mb-4 text-center">You are not logged in</p>
          <Button asChild className="w-full">
            <Link href="/login">Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Fetch user reviews and stats server-side
  try {
    const { reviews, stats } = await getUserReviewsAndStats();

    return <ProfileClient initialReviews={reviews} initialStats={stats} />;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    // If there's an auth error, redirect to login
    redirect("/login");
  }
}
