import { pbApi } from "@/lib/api/pocketbase";

async function getReviewData() {
  try {
    const movie = await pbApi.getAllMovieReviews();

    return movie;
  } catch (error) {
    console.error("Error fetching movie data:", error);
  }
}

export default async function Home() {
  const reviews = await getReviewData();
  console.log(reviews);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Movie</h1>
      </main>
    </div>
  );
}
