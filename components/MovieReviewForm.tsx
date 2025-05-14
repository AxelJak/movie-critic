"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

// Dynamically import the actual review form component with no SSR
// This is done in a client component, so it's allowed
const DynamicReviewForm = dynamic(() => import("./MovieReviewFormImpl"), {
  ssr: false,
  loading: () => (
    <Card className="p-4 text-center">
      <p className="text-muted-foreground">Loading review form...</p>
    </Card>
  ),
});

interface MovieReviewFormProps {
  movieId: string;
  tmdbId: number;
  onReviewSubmitted?: () => void;
}

/**
 * Client component wrapper for the review form
 * This handles the dynamic loading of the implementation
 */
export default function MovieReviewForm({
  movieId,
  tmdbId,
  onReviewSubmitted,
}: MovieReviewFormProps) {
  const [isClient, setIsClient] = useState(false);

  // This ensures the component only renders on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">Loading review form...</p>
      </Card>
    );
  }

  return (
    <DynamicReviewForm
      movieId={movieId}
      tmdbId={tmdbId}
      onReviewSubmitted={onReviewSubmitted}
    />
  );
}
