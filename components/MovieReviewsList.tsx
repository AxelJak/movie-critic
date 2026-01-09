import { getPocketBaseServer } from "@/lib/api/pocketbase-server";
import { MoviesResponse, MoviesRecord, ReviewsResponse, UsersResponse } from "@/lib/api/pocketbase-types";
import MovieCard from "@/components/MovieCard";

interface UserExpand {
  user: UsersResponse;
}

interface Expand {
  reviews_via_movie: ReviewsResponse<UserExpand>[];
}

export default async function MovieReviewsList() {
  try {
    const pb = await getPocketBaseServer();
    const result = await pb
      .collection("movies")
      .getList<MoviesResponse<MoviesRecord, Expand>>(1, 20, {
        sort: "-created",
        expand: "reviews_via_movie.user",
      });
    const movies = result.items;

    return (
      <>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </>
    );
  } catch (error) {
    console.error("Error fetching movie reviews:", error);
    // Return empty list on error
    return <></>;
  }
}
