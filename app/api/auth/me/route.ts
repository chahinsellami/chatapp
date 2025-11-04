import { NextRequest } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import { getUserById, initializeDatabase } from "@/lib/postgres";

/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();

    // Authenticate request
    const authPayload = authenticateRequest(request);
    if (!authPayload) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Get full user details
    const user = await getUserById(authPayload.userId);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    return Response.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      bio: user.bio,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return createErrorResponse("Failed to get user", 500);
  }
}
