import { getPocketBaseServer } from "@/lib/api/pocketbase-server";
import { MoviesResponse, MoviesRecord, ReviewsResponse, UsersResponse } from "@/lib/api/pocketbase-types";
import MovieGridCard from "@/components/MovieGridCard";

interface UserExpand {
  user: UsersResponse;
}

interface Expand {
  reviews_via_movie: ReviewsResponse<UserExpand>[];
}

export default async function MovieReviewsList() {
  try {
    const pb = await getPocketBaseServer();

    // Get the latest reviews to find movies with recent reviews
    const reviewsResult = await pb
      .collection("reviews")
      .getList(1, 100, {
        sort: "-created",
        fields: "movie,created",
      });

    // Extract unique movie IDs in order of latest review
    const uniqueMovieIds: string[] = [];
    const seenMovies = new Set<string>();

    for (const review of reviewsResult.items) {
      if (review.movie && !seenMovies.has(review.movie)) {
        uniqueMovieIds.push(review.movie);
        seenMovies.add(review.movie);
        if (uniqueMovieIds.length >= 10) break;
      }
    }

    // Fetch the movies with their reviews
    if (uniqueMovieIds.length === 0) {
      return <></>;
    }

    const moviesResult = await pb
      .collection("movies")
      .getList<MoviesResponse<MoviesRecord, Expand>>(1, 10, {
        filter: uniqueMovieIds.map(id => `id="${id}"`).join(" || "),
        expand: "reviews_via_movie.user",
      });

    // Sort movies by the order they appeared in reviews
    const movieMap = new Map(moviesResult.items.map(m => [m.id, m]));
    const movies = uniqueMovieIds
      .map(id => movieMap.get(id))
      .filter((m): m is MoviesResponse<MoviesRecord, Expand> => m !== undefined);

    return (
      <>
        {movies.map((movie) => (
          <MovieGridCard key={movie.id} movie={movie} />
        ))}
      </>
    );
  } catch (error) {
    console.error("Error fetching movie reviews:", error);
    // Return empty list on error
    return <></>;
  }
}
