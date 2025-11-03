import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  initializeDatabase,
} from "@/lib/db";

/**
 * PUT /api/friends/requests/[requestId]?action=accept|reject
 * Accept or reject a friend request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const { requestId } = await params;

    if (!requestId || !action) {
      return createErrorResponse("Request ID and action are required");
    }

    if (!["accept", "reject"].includes(action)) {
      return createErrorResponse('Action must be "accept" or "reject"');
    }

    let result;
    if (action === "accept") {
      result = acceptFriendRequest(requestId);
    } else {
      result = rejectFriendRequest(requestId);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Friend request action error:", error);
    return createErrorResponse(
      error.message || "Failed to process friend request",
      500
    );
  }
}

/**
 * DELETE /api/friends/[friendId]
 * Remove a friend
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { requestId: friendId } = await params;

    if (!friendId) {
      return createErrorResponse("Friend ID is required");
    }

    removeFriend(user.userId, friendId);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Remove friend error:", error);
    return createErrorResponse("Failed to remove friend", 500);
  }
}
