import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer } from "@/lib/api/pocketbase-server";

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const pb = await getPocketBaseServer();

    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { movieId, rating, title, content, containsSpoilers } = body;

    if (!movieId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: movieId and rating" },
        { status: 400 }
      );
    }

    const review = await pb.collection("reviews").create({
      user: pb.authStore.record?.id,
      movie: movieId,
      rating,
      title: title || "",
      content: content || "",
      contains_spoilers: containsSpoilers || false,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
