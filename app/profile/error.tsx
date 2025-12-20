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
    console.error("Profile page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <Card className="p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn&apos;t load your profile. Please try again or check if you&apos;re logged in.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/login">Go to login</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
