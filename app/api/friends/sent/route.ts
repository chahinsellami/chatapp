import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import { getSentFriendRequests, initializeDatabase } from "@/lib/postgres";

/**
 * GET /api/friends/sent
 * Get all outgoing (sent) friend requests of the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const sentRequests = await getSentFriendRequests(user.userId);

    return NextResponse.json({ sentRequests });
  } catch (error) {
    console.error("Error fetching sent friend requests:", error);
    return createErrorResponse("Failed to fetch sent friend requests", 500);
  }
}
