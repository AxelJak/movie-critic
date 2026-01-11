import { Suspense } from "react";
import MovieReviewsList from "@/components/MovieReviewsList";
import { Card } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

function ReviewsSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="w-full aspect-[2/3] bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen p-4 pb-12 sm:p-8 sm:pb-20 md:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Latest Reviewed Movies</h1>
        <Suspense fallback={<ReviewsSkeleton />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <MovieReviewsList />
          </div>
        </Suspense>
      </main>
    </div>
  );
}
