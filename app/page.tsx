import { pbApi } from "@/lib/api/pocketbase";
import MovieCard from "@/components/MovieCard";

export default async function Home() {
  const result = await pbApi.getAllMovieReviews();
  const movies = result.items;
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </main>
    </div>
  );
}
