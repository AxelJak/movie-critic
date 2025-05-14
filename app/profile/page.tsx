"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/use-auth";
import { pbApi } from "@/lib/api/pocketbase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Review, Movie } from "@/lib/api/types";
import { ListResult } from "pocketbase";
import ProfileEditor from "@/components/ProfileEditor";

export default function Profile() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [reviews, setReviews] = useState<ListResult<Review> | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reviews");
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    genrePreferences: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserReviews();
    }
  }, [isAuthenticated, user]);

  const fetchUserReviews = async () => {
    setReviewsLoading(true);
    try {
      const userReviews = await pbApi.getUserReviews();
      setReviews(userReviews);

      // Calculate stats
      if (userReviews.items.length > 0) {
        // Calculate average rating
        const totalRating = userReviews.items.reduce(
          (sum, review) => sum + review.rating,
          0,
        );
        const average = totalRating / userReviews.items.length;

        // We'll need to fetch genre data from the expanded movie records
        const genreCounts = new Map<string, number>();

        // Track which movies we've processed (to fetch their details)
        const processedMovies = new Set<string>();
        const moviePromises = [];

        for (const review of userReviews.items) {
          if (!processedMovies.has(review.movie)) {
            processedMovies.add(review.movie);
            moviePromises.push(pbApi.getMovie(review.movie));
          }
        }

        const movies = await Promise.all(moviePromises);

        // Count genres from all reviewed movies
        for (const movie of movies) {
          for (const genre of movie.genres) {
            const currentCount = genreCounts.get(genre.name) || 0;
            genreCounts.set(genre.name, currentCount + 1);
          }
        }

        // Convert to array and sort by count
        const genrePrefs = Array.from(genreCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 genres

        setStats({
          totalReviews: userReviews.totalItems,
          averageRating: Number(average.toFixed(1)),
          genrePreferences: genrePrefs,
        });
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!isAuthenticated) {
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

  return (
    <div className="container mx-auto p-4">
      {showProfileEditor ? (
        <ProfileEditor
          onClose={() => {
            setShowProfileEditor(false);
            // Refresh user reviews after profile update
            fetchUserReviews();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center">
                {user?.avatar ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <span className="text-3xl">
                      {user?.name.charAt(0) || "?"}
                    </span>
                  </div>
                )}

                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                <p className="text-sm mb-2">
                  Member since{" "}
                  {new Date(user?.created || "").toLocaleDateString("sv")}
                </p>

                <div className="w-full mt-4">
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={() => setShowProfileEditor(true)}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs
              defaultValue="reviews"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="w-full mb-4">
                <TabsTrigger value="reviews" className="flex-1">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex-1">
                  Stats
                </TabsTrigger>
                <TabsTrigger value="watchlists" className="flex-1">
                  Watchlists
                </TabsTrigger>
              </TabsList>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Your Reviews</h3>

                  {reviewsLoading ? (
                    <p>Loading reviews...</p>
                  ) : reviews?.items.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="mb-4">
                        You haven&apos;t written any reviews yet.
                      </p>
                      <Button asChild>
                        <Link href="/movies">Browse Movies</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews?.items.map((review) => {
                        // Check if movie data is available through expand
                        const movieData = review.expand?.movie as Movie;

                        return (
                          <Card
                            key={review.id}
                            className="p-4 flex flex-col md:flex-row gap-4"
                          >
                            {movieData && movieData.poster_path ? (
                              <div className="flex-shrink-0">
                                <Link href={`/movie/${movieData.tmdb_id}`}>
                                  <div className="relative w-24 h-36 rounded overflow-hidden">
                                    <Image
                                      src={`https://image.tmdb.org/t/p/w200${movieData.poster_path}`}
                                      alt={movieData.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </Link>
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-24 h-36 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                              </div>
                            )}

                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Link
                                    href={`/movie/${movieData?.tmdb_id || review.movie}`}
                                  >
                                    <h4 className="text-lg font-bold hover:underline">
                                      {movieData?.title || "Movie"}
                                    </h4>
                                  </Link>

                                  {review.title && (
                                    <p className="text-md font-semibold">
                                      {review.title}
                                    </p>
                                  )}
                                </div>

                                <div className="bg-blue-500 text-white px-2 py-1 rounded-md">
                                  {review.rating}/10
                                </div>
                              </div>

                              {review.content && (
                                <p className="mt-2 text-gray-600 line-clamp-3">
                                  {review.content}
                                </p>
                              )}

                              <div className="mt-2 flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  {new Date(review.created).toLocaleDateString(
                                    "sv",
                                  )}
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
                                    onClick={() => {
                                      if (
                                        confirm(
                                          "Are you sure you want to delete this review?",
                                        )
                                      ) {
                                        pbApi
                                          .deleteReview(review.id)
                                          .then(() => {
                                            fetchUserReviews();
                                          });
                                      }
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}

                      {/* Pagination would go here if needed */}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Your Movie Stats</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-blue-50">
                      <h4 className="text-lg font-semibold mb-2">
                        Total Reviews
                      </h4>
                      <p className="text-3xl font-bold">{stats.totalReviews}</p>
                    </Card>

                    <Card className="p-4 bg-green-50">
                      <h4 className="text-lg font-semibold mb-2">
                        Average Rating
                      </h4>
                      <p className="text-3xl font-bold">
                        {stats.averageRating}/10
                      </p>
                    </Card>

                    <Card className="p-4 bg-purple-50 md:col-span-2">
                      <h4 className="text-lg font-semibold mb-2">
                        Genre Preferences
                      </h4>
                      {stats.genrePreferences.length === 0 ? (
                        <p>Rate more movies to see your genre preferences.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {stats.genrePreferences.map((genre) => (
                            <div
                              key={Math.random()}
                              className="px-3 py-1 bg-purple-100 rounded-full"
                            >
                              {genre.name} ({genre.count})
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                </Card>
              </TabsContent>

              {/* Watchlists Tab */}
              <TabsContent value="watchlists">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Your Watchlists</h3>

                  <p className="text-center py-6">
                    Watchlist functionality coming soon!
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
