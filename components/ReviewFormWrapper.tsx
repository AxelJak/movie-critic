import { Suspense } from 'react';
import MovieReviewForm from './MovieReviewForm';

interface ReviewFormWrapperProps {
  movieId: string;
  tmdbId: number;
}

/**
 * Server component wrapper for the client-side review form
 * Uses a simpler approach without dynamic imports
 */
export default function ReviewFormWrapper({ 
  movieId, 
  tmdbId 
}: ReviewFormWrapperProps) {
  return (
    <Suspense fallback={
      <div className="p-4 text-center border border-muted rounded-md">
        <p className="text-muted-foreground">Loading review form...</p>
      </div>
    }>
      <MovieReviewForm 
        movieId={movieId} 
        tmdbId={tmdbId} 
      />
    </Suspense>
  );
}
