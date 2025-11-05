import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import { initializeDatabase, pool } from "@/lib/postgres";

/**
 * DELETE /api/friends/[friendId]
 * Remove a friend
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { friendId } = await params;

    if (!friendId) {
      return createErrorResponse("Friend ID is required");
    }

    // Remove friendship from both directions
    await pool.query(
      `DELETE FROM friends 
       WHERE (user_id = $1 AND friend_id = $2) 
       OR (user_id = $2 AND friend_id = $1)`,
      [user.userId, friendId]
    );

    return NextResponse.json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Remove friend error:", error);
    return createErrorResponse("Failed to remove friend", 500);
  }
}
