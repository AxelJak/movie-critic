import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer } from "@/lib/api/pocketbase-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/reviews/[id] - Update a review
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const pb = await getPocketBaseServer();

    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    // Verify the review belongs to the authenticated user
    const existingReview = await pb.collection("reviews").getOne(id);
    if (existingReview.user !== pb.authStore.record?.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own reviews" },
        { status: 403 }
      );
    }

    const review = await pb.collection("reviews").update(id, body);

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const pb = await getPocketBaseServer();

    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Verify the review belongs to the authenticated user
    const existingReview = await pb.collection("reviews").getOne(id);
    if (existingReview.user !== pb.authStore.record?.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own reviews" },
        { status: 403 }
      );
    }

    await pb.collection("reviews").delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
