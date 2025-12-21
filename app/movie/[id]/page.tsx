import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Review } from "@/lib/api/types";
import { pbApi } from "@/lib/api/pocketbase";
import { tmdbApi } from "@/lib/api/tmdb";
import { formatDate, formatRuntime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import ReviewFormWrapper from "@/components/ReviewFormWrapper";

export const dynamic = 'force-dynamic';

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
type PageProps = {
  params: Promise<{ id: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const movie = await tmdbApi.getMovieDetails(parseInt(id));

    const title = `${movie.title} - Movie Critic`;
    const description = movie.overview || `Watch and review ${movie.title}`;
    const imageUrl = movie.poster_path
      ? tmdbApi.getImageUrl(movie.poster_path, "w500")
      : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [{ url: imageUrl, alt: movie.title }] : undefined,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Movie Details - Movie Critic",
      description: "Discover and review movies",
    };
  }
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
  const { id } = await params;
  const { movie, cast, reviews, pocketbaseMovieId } = await getMovieData(id);

  // Get average site rating
  const siteRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh]">
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
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(1920, 1080))}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}

        <div className="container relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 h-full pb-6 sm:pb-8 px-4 sm:px-6">
          <div className="flex-shrink-0 w-32 sm:w-40 md:w-48 aspect-[2/3] relative mt-auto drop-shadow-xl rounded-md overflow-hidden">
            <Image
              src={
                tmdbApi.getImageUrl(movie.poster_path, "w500") ||
                "/placeholder.jpg"
              }
              alt={movie.title}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(500, 750))}`}
            />
          </div>
          <div className="flex flex-col mt-auto text-white text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold drop-shadow-lg">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2 text-xs sm:text-sm md:text-base text-gray-200 justify-center sm:justify-start">
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
      <div className="container py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Details and Cast */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Ratings Section */}
            <div className="flex flex-shrink-0 flex-row justify-center sm:justify-start gap-6 sm:gap-8 p-4 sm:p-6 bg-card rounded-lg shadow">
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm font-medium">Our Rating</span>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {siteRating.toFixed(1)}
                  <span className="text-sm sm:text-base font-normal text-muted-foreground">
                    /10
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              <div className="h-12 w-px bg-border" />

              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm font-medium">TMDB Rating</span>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {movie.vote_average.toFixed(1)}
                  <span className="text-sm sm:text-base font-normal text-muted-foreground">
                    /10
                  </span>
                </div>
              </div>
            </div>

            {/* Movie Details */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">About</h2>
              <div className="space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{movie.overview}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {movie.release_date && (
                    <div className="text-sm sm:text-base">
                      <span className="font-medium">Release Date: </span>
                      <span className="text-muted-foreground">
                        {formatDate(movie.release_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section - shown on mobile only */}
            <div className="lg:hidden">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold">Reviews</h2>

                {/* Add review form */}
                <div className="mb-4 sm:mb-6">
                  <ReviewFormWrapper
                    movieId={pocketbaseMovieId}
                    tmdbId={movie.id}
                  />
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
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
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-medium text-sm sm:text-base truncate">
                                {review.expand.user.name}
                              </span>
                              <div className="flex items-center flex-shrink-0">
                                <span className="font-bold text-sm sm:text-base">{review.rating}</span>
                                <span className="text-xs text-muted-foreground">
                                  /10
                                </span>
                              </div>
                            </div>
                            {review.title && (
                              <h4 className="font-medium mt-1 text-sm sm:text-base">{review.title}</h4>
                            )}
                            {review.content && (
                              <p className="text-xs sm:text-sm mt-1 text-muted-foreground line-clamp-3">
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
                      <Button variant="outline" className="w-full text-sm sm:text-base">
                        View All {reviews.length} Reviews
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 sm:p-8 border border-dashed rounded-lg">
                    <p className="text-sm sm:text-base text-muted-foreground">No reviews yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cast Section */}
            {cast.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Cast</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                  {cast.map((member) => (
                    <Link
                      key={member.id}
                      href={`/actor/${member.id}`}
                      className="flex flex-col items-center text-center group"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-2 ring-2 ring-transparent group-hover:ring-primary transition-all">
                        <Image
                          src={
                            tmdbApi.getImageUrl(member.profile_path, "w185") ||
                            "/placeholder-avatar.jpg"
                          }
                          alt={member.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span className="font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {member.name}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {member.character}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Reviews - shown on desktop only */}
          <div className="hidden lg:block">
            <div className="lg:sticky lg:top-4 space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Reviews</h2>

              {/* Add review form */}
              <div className="mb-4 sm:mb-6">
                <ReviewFormWrapper
                  movieId={pocketbaseMovieId}
                  tmdbId={movie.id}
                />
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
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
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium text-sm sm:text-base truncate">
                              {review.expand.user.name}
                            </span>
                            <div className="flex items-center flex-shrink-0">
                              <span className="font-bold text-sm sm:text-base">{review.rating}</span>
                              <span className="text-xs text-muted-foreground">
                                /10
                              </span>
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="font-medium mt-1 text-sm sm:text-base">{review.title}</h4>
                          )}
                          {review.content && (
                            <p className="text-xs sm:text-sm mt-1 text-muted-foreground line-clamp-3">
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
                    <Button variant="outline" className="w-full text-sm sm:text-base">
                      View All {reviews.length} Reviews
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 sm:p-8 border border-dashed rounded-lg">
                  <p className="text-sm sm:text-base text-muted-foreground">No reviews yet</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
