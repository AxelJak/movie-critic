"use client";

import React, { useEffect, useReducer, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { pbApi } from "@/lib/api/pocketbase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Star } from "lucide-react";
import { ReviewsResponse } from "@/lib/api/pocketbase-types";

// Form state management
type FormState = {
  title: string;
  content: string;
  rating: number;
  containsSpoilers: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  hasReviewed: boolean;
  userReview: ReviewsResponse | null; // More specific than any
  isLoading: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: unknown }
  | { type: "SET_REVIEW"; review: ReviewsResponse }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; message: string }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "RESET_FORM" }
  | { type: "SET_LOADING"; isLoading: boolean };

const initialFormState: FormState = {
  title: "",
  content: "",
  rating: 5,
  containsSpoilers: false,
  isSubmitting: false,
  error: null,
  success: null,
  hasReviewed: false,
  userReview: null,
  isLoading: true,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_REVIEW":
      return {
        ...state,
        title: action.review.title || "",
        content: action.review.content || "",
        rating: action.review.rating,
        containsSpoilers: action.review.contains_spoilers,
        hasReviewed: true,
        userReview: action.review,
      };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true, error: null, success: null };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        isSubmitting: false,
        success: action.message,
        error: null,
      };
    case "SUBMIT_ERROR":
      return {
        ...state,
        isSubmitting: false,
        error: action.error,
        success: null,
      };
    case "RESET_FORM":
      return {
        ...initialFormState,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
}

interface MovieReviewFormImplProps {
  movieId: string;
  tmdbId: number;
  onReviewSubmitted?: () => void;
}

export default function MovieReviewFormImpl({
  movieId,
  tmdbId,
  onReviewSubmitted,
}: MovieReviewFormImplProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [isPending, startTransition] = useTransition();

  // Check if user has already reviewed this movie
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!isAuthenticated || !movieId) {
        dispatch({ type: "SET_LOADING", isLoading: false });
        return;
      }

      try {
        const review = await pbApi.getUserReviewForMovie(movieId);
        if (review) {
          dispatch({ type: "SET_REVIEW", review });
        }
      } catch (error) {
        console.error("Error checking for existing review:", error);
        // Don't set an error message here, just log it
      } finally {
        dispatch({ type: "SET_LOADING", isLoading: false });
      }
    };

    checkExistingReview();
  }, [isAuthenticated, movieId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      dispatch({
        type: "SUBMIT_ERROR",
        error: "You must be logged in to submit a review",
      });
      return;
    }

    if (state.rating < 1 || state.rating > 10) {
      dispatch({
        type: "SUBMIT_ERROR",
        error: "Rating must be between 1 and 10",
      });
      return;
    }

    dispatch({ type: "SUBMIT_START" });
    console.log(state);

    try {
      // First check if the movie exists in our database, if not sync it
      let pocketbaseMovieId = movieId;

      if (!pocketbaseMovieId) {
        // Try to get the movie from PocketBase by TMDB ID
        const movie = await pbApi.getMovieByTmdbId(tmdbId);

        if (movie?.id) {
          pocketbaseMovieId = movie.id;
        } else {
          // Movie doesn't exist, sync it from TMDB using the API route
          console.log("Movie not found in PocketBase, syncing from TMDB:", tmdbId);

          const response = await fetch('/api/movies/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tmdbId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to sync movie');
          }

          const syncedMovie = await response.json();
          pocketbaseMovieId = syncedMovie.id;
        }
      }

      // Ensure we have a valid movie ID before creating/updating review
      if (!pocketbaseMovieId) {
        throw new Error("Failed to get or create movie in database");
      }

      if (state.hasReviewed && state.userReview) {
        // Update existing review
        console.log(state);
        await pbApi.updateReview(state.userReview.id, {
          rating: state.rating,
          title: state.title,
          content: state.content,
          contains_spoilers: state.containsSpoilers,
        });

        dispatch({
          type: "SUBMIT_SUCCESS",
          message: "Your review has been updated!",
        });
      } else {
        // Create new review
        await pbApi.createReview(
          pocketbaseMovieId,
          state.rating,
          state.title,
          state.content,
          state.containsSpoilers,
        );

        dispatch({
          type: "SUBMIT_SUCCESS",
          message: "Your review has been submitted!",
        });
      }

      // Refresh the page in the background without blocking
      startTransition(() => {
        router.refresh();
      });

      // Notify parent component (if needed)
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      dispatch({
        type: "SUBMIT_ERROR",
        error: "Failed to submit review. Please try again.",
      });
    }
  };

  if (state.isLoading) {
    return (
      <Card className="p-4 text-center">
        <p>Loading...</p>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-4 text-center">
        <p className="mb-4">You need to be logged in to write a review.</p>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/login")}
        >
          Go to Login
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {state.hasReviewed && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-600 dark:text-blue-400">
              You&apos;ve already reviewed this movie
            </span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <Label htmlFor="rating" className="text-base font-semibold">
              Your Rating
            </Label>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <Button
                key={value}
                type="button"
                variant={state.rating === value ? "default" : "outline"}
                size="sm"
                className={`w-9 h-9 p-0 transition-all ${state.rating === value
                    ? "scale-110 shadow-md"
                    : "hover:scale-105"
                  }`}
                onClick={() =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "rating",
                    value,
                  })
                }
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Review Title <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="title"
            value={state.title}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "title",
                value: e.target.value,
              })
            }
            placeholder="Give your review a catchy title..."
            maxLength={100}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            Your Thoughts <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Tabs defaultValue="write" className="w-full">
            <TabsList className="mb-2 w-full sm:w-auto">
              <TabsTrigger value="write" className="flex-1 sm:flex-none">Write</TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 sm:flex-none">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-0">
              <Textarea
                id="content"
                value={state.content}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "content",
                    value: e.target.value,
                  })
                }
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts about the movie... (Cmd+Enter to submit)"
                className="min-h-[120px] resize-y"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-0">
              <div className="min-h-[120px] p-3 border rounded-md bg-muted overflow-auto">
                {state.content ? (
                  <p className="text-sm whitespace-pre-wrap">{state.content}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nothing to preview yet...
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
          <input
            type="checkbox"
            id="spoiler"
            checked={state.containsSpoilers}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "containsSpoilers",
                value: e.target.checked,
              })
            }
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
          />
          <Label htmlFor="spoiler" className="text-sm cursor-pointer">
            This review contains spoilers
          </Label>
        </div>

        {state.error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
            <span className="text-sm">{state.error}</span>
          </div>
        )}

        {state.success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{state.success}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={state.isSubmitting}
          className="w-full h-11 text-base font-semibold"
          size="lg"
        >
          {state.isSubmitting
            ? "Submitting..."
            : state.hasReviewed
              ? "Update Review"
              : "Submit Review"}
        </Button>
      </form>
    </Card>
  );
}
