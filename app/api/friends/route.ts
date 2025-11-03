import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import {
  getUserFriends,
  getPendingFriendRequests,
  sendFriendRequest,
  initializeDatabase,
} from "@/lib/db";

/**
 * GET /api/friends
 * Get all friends and pending requests of the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const friends = getUserFriends(user.userId);
    const pendingRequests = getPendingFriendRequests(user.userId);

    return NextResponse.json({ friends, pendingRequests });
  } catch (error) {
    console.error("Friends GET error:", error);
    return createErrorResponse("Failed to fetch friends", 500);
  }
}

/**
 * POST /api/friends
 * Send a friend request
 * Body: { receiverId: string }
 */
export async function POST(request: NextRequest) {
  try {
    initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { receiverId } = body;

    if (!receiverId) {
      return createErrorResponse("Receiver ID is required");
    }

    if (receiverId === user.userId) {
      return createErrorResponse("Cannot send friend request to yourself");
    }

    const friendRequest = sendFriendRequest(user.userId, receiverId);

    return NextResponse.json(friendRequest, { status: 201 });
  } catch (error: any) {
    console.error("Friends POST error:", error);
    if (error.message.includes("already exists")) {
      return createErrorResponse(error.message, 400);
    }
    return createErrorResponse("Failed to send friend request", 500);
  }
}
