import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer } from "@/lib/api/pocketbase-server";
import { tmdbApi } from "@/lib/api/tmdb";
import { Collections, MoviesResponse } from "@/lib/api/pocketbase-types";
import { TMDBCastMember } from "@/lib/api/types";

// POST /api/movies/sync - Sync a movie from TMDB to PocketBase
export async function POST(request: NextRequest) {
  try {
    const pb = await getPocketBaseServer();

    const body = await request.json();
    const { tmdbId } = body;

    if (!tmdbId) {
      return NextResponse.json(
        { error: "Missing required field: tmdbId" },
        { status: 400 }
      );
    }

    // Check if movie already exists
    try {
      const existingMovie = await pb
        .collection(Collections.Movies)
        .getFirstListItem<MoviesResponse>(`tmdb_id=${tmdbId}`);

      // If it exists but was last synced more than 7 days ago, update it
      const lastSynced = new Date(existingMovie.last_synced);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (lastSynced >= sevenDaysAgo) {
        // Movie is up to date, return it
        return NextResponse.json(existingMovie);
      }

      // Update movie
      const movie = await updateMovieFromTMDB(pb, tmdbId, existingMovie.id);
      return NextResponse.json(movie);
    } catch (error) {
      // Movie doesn't exist, create it
      console.log("Movie doesn't exist, creating it from TMDB:", tmdbId);
    }

    // Fetch movie details from TMDB
    const tmdbMovie = await tmdbApi.getMovieDetails(tmdbId);
    const director = tmdbApi.getDirector(tmdbMovie);

    console.log("Got TMDB movie details:", {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
    });

    // Create movie in PocketBase
    const movie = await pb
      .collection(Collections.Movies)
      .create<MoviesResponse>({
        tmdb_id: tmdbMovie.id,
        title: tmdbMovie.title,
        original_title: tmdbMovie.original_title,
        poster_path: tmdbMovie.poster_path,
        backdrop_path: tmdbMovie.backdrop_path,
        release_date: tmdbMovie.release_date,
        runtime: tmdbMovie.runtime,
        overview: tmdbMovie.overview,
        tmdb_rating: tmdbMovie.vote_average,
        director,
        genres: tmdbMovie.genres,
        last_synced: new Date().toISOString(),
      });

    console.log("Created movie in PocketBase:", movie.id);

    // Sync cast members sequentially to avoid auto-cancellation
    await syncCastMembers(pb, movie.id, tmdbApi.getCast(tmdbMovie));

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error("Error syncing movie:", error);
    return NextResponse.json(
      { error: `Failed to sync movie: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * Update movie data from TMDB
 */
async function updateMovieFromTMDB(
  pb: any,
  tmdbId: number,
  movieId: string,
): Promise<MoviesResponse> {
  const tmdbMovie = await tmdbApi.getMovieDetails(tmdbId);
  const director = tmdbApi.getDirector(tmdbMovie);

  const movie = await pb
    .collection(Collections.Movies)
    .update(movieId, {
      title: tmdbMovie.title,
      original_title: tmdbMovie.original_title,
      poster_path: tmdbMovie.poster_path,
      backdrop_path: tmdbMovie.backdrop_path,
      release_date: tmdbMovie.release_date,
      runtime: tmdbMovie.runtime,
      overview: tmdbMovie.overview,
      tmdb_rating: tmdbMovie.vote_average,
      director,
      genres: tmdbMovie.genres,
      last_synced: new Date().toISOString(),
    });

  await syncCastMembers(pb, movie.id, tmdbApi.getCast(tmdbMovie));

  return movie;
}

/**
 * Sync cast members for a movie sequentially to avoid auto-cancellation
 */
async function syncCastMembers(
  pb: any,
  movieId: string,
  cast: TMDBCastMember[],
): Promise<void> {
  // First, get all existing cast members for this movie
  const existingCastMembers = await pb
    .collection("cast_members")
    .getFullList({
      filter: `movie="${movieId}"`,
    });

  // Delete existing cast members sequentially
  for (const member of existingCastMembers) {
    await pb.collection("cast_members").delete(member.id);
  }

  // Create new cast members sequentially to avoid auto-cancellation
  for (const member of cast) {
    await pb.collection("cast_members").create({
      movie: movieId,
      tmdb_id: member.id,
      name: member.name,
      character: member.character,
      profile_path: member.profile_path,
      order: member.order,
    });
  }
}
