"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Movie details error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn&apos;t load this movie. It might not exist or there was an error fetching the data.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/movies">Browse movies</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
