"use client";

import React, { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { pbApi } from "@/lib/api/pocketbase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";

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
  userReview: any; // Using any for now, could be typed better
  isLoading: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "SET_REVIEW"; review: any }
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
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(formReducer, initialFormState);

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
        try {
          const movie = await pbApi.getMovieByTmdbId(tmdbId);
          pocketbaseMovieId = movie.id;
        } catch (error) {
          console.log("Movie not found, syncing from TMDB:", error);
          // If movie doesn't exist, sync it from TMDB
          const movie = await pbApi.syncMovieFromTMDB(tmdbId);
          pocketbaseMovieId = movie.id;
        }
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

      // Refresh the page to show the new/updated review
      router.refresh();

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
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="rating" className="block mb-1">
              Rating (1-10)
            </Label>
            {state.hasReviewed && (
              <span className="text-sm text-muted-foreground">
                You've already reviewed this movie
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <Button
                key={value}
                type="button"
                variant={state.rating === value ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
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

          <div>
            <Label htmlFor="title" className="block mb-1">
              Review Title (Optional)
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
              placeholder="Give your review a title"
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="content" className="block mb-1">
              Review (Optional)
            </Label>
            <Tabs defaultValue="write">
              <TabsList className="mb-2">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <textarea
                  id="content"
                  value={state.content}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "content",
                      value: e.target.value,
                    })
                  }
                  className="w-full h-32 p-2 border rounded-md border-input bg-background"
                  placeholder="Share your thoughts about the movie..."
                ></textarea>
              </TabsContent>
              <TabsContent value="preview">
                <div className="w-full h-32 p-2 overflow-auto border rounded-md border-input bg-muted">
                  {state.content ? (
                    <div className="prose prose-sm max-w-none">
                      {state.content}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Nothing to preview
                    </span>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex items-center">
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
              className="mr-2 h-4 w-4"
            />
            <Label htmlFor="spoiler" className="text-sm">
              This review contains spoilers
            </Label>
          </div>

          {state.error && (
            <div className="p-2 bg-destructive/10 text-destructive rounded-md text-sm">
              {state.error}
            </div>
          )}

          {state.success && (
            <div className="p-2 bg-green-100 text-green-800 rounded-md text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              {state.success}
            </div>
          )}

          <Button
            type="submit"
            disabled={state.isSubmitting}
            className="w-full"
          >
            {state.isSubmitting
              ? "Submitting..."
              : state.hasReviewed
                ? "Update Review"
                : "Submit Review"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
