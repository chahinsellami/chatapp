import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequest,
  initializeDatabase,
} from "@/lib/postgres";

/**
 * PUT /api/friends/requests/[requestId]?action=accept|reject
 * Accept or reject a friend request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    await initializeDatabase();

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

    const friendRequest = await getFriendRequest(requestId);
    if (!friendRequest) {
      return createErrorResponse("Friend request not found", 404);
    }

    let result;
    if (action === "accept") {
      result = await acceptFriendRequest(
        requestId,
        user.userId,
        friendRequest.sender_id
      );
    } else {
      result = await rejectFriendRequest(requestId);
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
 * Remove a friend (future implementation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    // TODO: Implement removeFriend in PostgreSQL
    // For now, return not implemented
    return createErrorResponse("Remove friend feature coming soon", 501);
  } catch (error) {
    console.error("Remove friend error:", error);
    return createErrorResponse("Failed to remove friend", 500);
  }
}
