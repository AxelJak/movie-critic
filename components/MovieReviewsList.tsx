import { pbApi } from "@/lib/api/pocketbase";
import MovieCard from "@/components/MovieCard";

export default async function MovieReviewsList() {
  const result = await pbApi.getAllMovieReviews();
  const movies = result.items;

  return (
    <>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </>
  );
}
