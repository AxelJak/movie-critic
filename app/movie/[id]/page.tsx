import React from "react";
import Image from "next/image";
import { Review } from "@/lib/api/types";
import { pbApi } from "@/lib/api/pocketbase";
import { tmdbApi } from "@/lib/api/tmdb";
import { formatDate, formatRuntime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import ReviewFormWrapper from "@/components/ReviewFormWrapper";

// Define expanded review type with user data
interface ExpandedReview extends Review {
  expand: {
    user: {
      id: string;
      name: string;
      avatar: string;
    };
  };
}

// Define the props for the page
interface PageProps {
  params: {
    id: string;
  };
}

// Function to fetch movie data
async function getMovieData(id: string) {
  try {
    // Always fetch from TMDB first as it's more reliable
    const movie = await tmdbApi.getMovieDetails(parseInt(id));
    const cast = tmdbApi.getCast(movie);

    // Try to get the movie from our database by TMDB ID
    let pocketbaseMovieId = "";
    let reviews: ExpandedReview[] = [];

    try {
      console.log("Attempting to fetch movie from PocketBase:", id);
      const existingMovie = await pbApi.getMovieByTmdbId(parseInt(id));
      if (existingMovie) {
        pocketbaseMovieId = existingMovie.id;

        // If we have the movie in our database, fetch reviews
        if (pocketbaseMovieId) {
          try {
            const reviewsResponse =
              await pbApi.getMovieReviews(pocketbaseMovieId);
            reviews = reviewsResponse.items as unknown as ExpandedReview[];
          } catch (reviewError) {
            console.error("Error fetching reviews:", reviewError);
            // Continue with empty reviews if there's an error
          }
        }
      }
    } catch (pbError) {
      console.error("PocketBase error:", pbError);
      // Continue with empty PocketBase data - we still have the TMDB data
      // so the page can render with basic information
    }

    return { movie, cast, reviews, pocketbaseMovieId };
  } catch (error) {
    console.error("Error fetching movie data:", error);
    return notFound();
  }
}

export default async function MovieDetailsPage({ params }: PageProps) {
  const { id } = params;
  const { movie, cast, reviews, pocketbaseMovieId } = await getMovieData(id);

  // Get average site rating
  const siteRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        {movie.backdrop_path ? (
          <div className="absolute inset-0">
            <Image
              src={
                tmdbApi.getImageUrl(movie.backdrop_path, "original") ||
                "/placeholder.jpg"
              }
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}

        <div className="container relative z-10 flex flex-col md:flex-row items-end gap-6 h-full pb-8">
          <div className="flex-shrink-0 w-32 md:w-48 aspect-[2/3] relative mt-auto drop-shadow-xl rounded-md overflow-hidden">
            <Image
              src={
                tmdbApi.getImageUrl(movie.poster_path, "w500") ||
                "/placeholder.jpg"
              }
              alt={movie.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col mt-auto text-gray-700">
            <h1 className="text-3xl md:text-5xl font-bold">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2 text-sm md:text-base text-gray-500">
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
              {movie.runtime && <span>• {formatRuntime(movie.runtime)}</span>}
              {movie.genres && movie.genres.length > 0 && (
                <span>
                  • {movie.genres.map((genre) => genre.name).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details and Cast */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ratings Section */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-card rounded-lg shadow">
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">Our Rating</span>
                <div className="text-3xl font-bold mt-1">
                  {siteRating.toFixed(1)}
                  <span className="text-base font-normal text-muted-foreground">
                    /10
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              <div className="h-12 w-px bg-border hidden md:block" />

              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">TMDB Rating</span>
                <div className="text-3xl font-bold mt-1">
                  {movie.vote_average.toFixed(1)}
                  <span className="text-base font-normal text-muted-foreground">
                    /10
                  </span>
                </div>
              </div>
            </div>

            {/* Movie Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">{movie.overview}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movie.director && (
                    <div>
                      <span className="font-medium">Director: </span>
                      <span className="text-muted-foreground">
                        {movie.director}
                      </span>
                    </div>
                  )}
                  {movie.release_date && (
                    <div>
                      <span className="font-medium">Release Date: </span>
                      <span className="text-muted-foreground">
                        {formatDate(movie.release_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cast Section */}
            {cast.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {cast.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-2">
                        <Image
                          src={
                            tmdbApi.getImageUrl(member.profile_path, "w185") ||
                            "/placeholder-avatar.jpg"
                          }
                          alt={member.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <span className="font-medium text-sm line-clamp-1">
                        {member.name}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {member.character}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Reviews */}
          <div>
            <div className="sticky top-4 space-y-4">
              <h2 className="text-2xl font-semibold">Reviews</h2>

              {/* Add review form */}
              <div className="mb-6">
                <ReviewFormWrapper
                  movieId={pocketbaseMovieId}
                  tmdbId={movie.id}
                />
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              review.expand.user?.avatar ||
                              "/placeholder-avatar.jpg"
                            }
                            alt={review.expand.user.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {review.expand.user.name}
                            </span>
                            <div className="flex items-center">
                              <span className="font-bold">{review.rating}</span>
                              <span className="text-xs text-muted-foreground">
                                /10
                              </span>
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="font-medium mt-1">{review.title}</h4>
                          )}
                          {review.content && (
                            <p className="text-sm mt-1 text-muted-foreground line-clamp-3">
                              {review.contains_spoilers && (
                                <span className="text-xs font-medium text-destructive mr-1">
                                  [SPOILERS]
                                </span>
                              )}
                              {review.content}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            {formatDate(review.created)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {reviews.length > 3 && (
                    <Button variant="outline" className="w-full">
                      View All {reviews.length} Reviews
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
