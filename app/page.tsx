import { Suspense } from "react";
import MovieReviewsList from "@/components/MovieReviewsList";
import { Card } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

function ReviewsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="w-full max-w-2xl h-48 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </>
  );
}

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Suspense fallback={<ReviewsSkeleton />}>
          <MovieReviewsList />
        </Suspense>
      </main>
    </div>
  );
}
