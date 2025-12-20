import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { tmdbApi } from "@/lib/api/tmdb";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { TMDBMovieCredit } from "@/lib/api/types";

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

// Define the props for the page
type PageProps = {
  params: Promise<{ id: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const person = await tmdbApi.getPersonDetails(parseInt(id));

    const title = `${person.name} - Movie Critic`;
    const description = person.biography
      ? person.biography.substring(0, 155) + "..."
      : `View ${person.name}'s filmography and biography`;
    const imageUrl = person.profile_path
      ? tmdbApi.getImageUrl(person.profile_path, "w500")
      : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [{ url: imageUrl, alt: person.name }] : undefined,
        type: "profile",
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
      title: "Actor Details - Movie Critic",
      description: "Discover actor filmography and biography",
    };
  }
}

// Function to fetch actor data
async function getActorData(id: string) {
  try {
    const person = await tmdbApi.getPersonDetails(parseInt(id));
    const credits = await tmdbApi.getPersonMovieCredits(parseInt(id));

    // Filter and sort filmography - top 20 by release date (newest first)
    const filmography = credits.cast
      .filter((movie: TMDBMovieCredit) => movie.release_date) // Only movies with release dates
      .sort((a: TMDBMovieCredit, b: TMDBMovieCredit) => {
        const dateA = new Date(a.release_date).getTime();
        const dateB = new Date(b.release_date).getTime();
        return dateB - dateA; // Newest first
      })
      .slice(0, 20);

    return { person, filmography };
  } catch (error) {
    console.error("Error fetching actor data:", error);
    return notFound();
  }
}

// Calculate age from birthday
function calculateAge(birthday: string | null, deathday: string | null): string | null {
  if (!birthday) return null;

  const birthDate = new Date(birthday);
  const endDate = deathday ? new Date(deathday) : new Date();
  const age = endDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = endDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
    return (age - 1).toString();
  }

  return age.toString();
}

export default async function ActorDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const { person, filmography } = await getActorData(id);

  const age = calculateAge(person.birthday, person.deathday);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-gray-900 to-background">
        <div className="container relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 py-8 sm:py-12 px-4 sm:px-6">
          <div className="flex-shrink-0 w-32 sm:w-40 md:w-48 aspect-square relative drop-shadow-xl rounded-full overflow-hidden">
            <Image
              src={
                tmdbApi.getImageUrl(person.profile_path, "w500") ||
                "/placeholder-avatar.jpg"
              }
              alt={person.name}
              fill
              className="object-cover"
              priority
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(500, 500))}`}
            />
          </div>
          <div className="flex flex-col text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              {person.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2 text-xs sm:text-sm md:text-base text-gray-300 justify-center sm:justify-start">
              {person.known_for_department && (
                <span>{person.known_for_department}</span>
              )}
              {person.birthday && (
                <>
                  <span>•</span>
                  <span>
                    Born {formatDate(person.birthday)}
                    {age && ` (Age ${age})`}
                  </span>
                </>
              )}
              {person.place_of_birth && (
                <>
                  <span>•</span>
                  <span>{person.place_of_birth}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Biography and Filmography */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Biography Section */}
            {person.biography && (
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Biography</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}

            {/* Filmography Section */}
            {filmography.length > 0 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  Filmography ({filmography.length} {filmography.length === 20 ? "most recent" : ""} films)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {filmography.map((movie) => (
                    <Link
                      key={movie.credit_id}
                      href={`/movie/${movie.id}`}
                      className="group"
                    >
                      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-105">
                        <div className="aspect-[2/3] relative">
                          <Image
                            src={
                              tmdbApi.getImageUrl(movie.poster_path, "w342") ||
                              "/placeholder.jpg"
                            }
                            alt={movie.title}
                            fill
                            className="object-cover"
                            placeholder="blur"
                            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(342, 513))}`}
                          />
                        </div>
                        <div className="p-2 sm:p-3">
                          <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {movie.title}
                          </h3>
                          {movie.character && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              as {movie.character}
                            </p>
                          )}
                          {movie.release_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(movie.release_date).getFullYear()}
                            </p>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Quick Facts */}
          <div>
            <div className="lg:sticky lg:top-4 space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Quick Facts</h2>

              <Card className="p-4 sm:p-6 space-y-4">
                {person.known_for_department && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Known For</h3>
                    <p className="text-base mt-1">{person.known_for_department}</p>
                  </div>
                )}

                {person.birthday && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Birthday</h3>
                    <p className="text-base mt-1">
                      {formatDate(person.birthday)}
                      {age && ` (${age} years old)`}
                    </p>
                  </div>
                )}

                {person.deathday && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Died</h3>
                    <p className="text-base mt-1">{formatDate(person.deathday)}</p>
                  </div>
                )}

                {person.place_of_birth && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Place of Birth</h3>
                    <p className="text-base mt-1">{person.place_of_birth}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Films Featured</h3>
                  <p className="text-base mt-1">{filmography.length}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
