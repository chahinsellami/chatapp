import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import { initializeDatabase, getAllUsers } from "@/lib/db";

/**
 * GET /api/users/search?q=query
 * Search for users by username or email
 * Returns users matching the query (excluding current user)
 */
export async function GET(request: NextRequest) {
  try {
    initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Get all users and filter client-side
    // In production, would use database LIKE query or full-text search
    const allUsers = getAllUsers();

    const results = allUsers
      .filter((u) => {
        // Exclude current user
        if (u.id === user.userId) return false;

        // Match username or email
        return (
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        );
      })
      .slice(0, 20) // Limit to 20 results
      .map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        status: u.status,
      }));

    return NextResponse.json({ users: results });
  } catch (error) {
    console.error("User search error:", error);
    return createErrorResponse("Failed to search users", 500);
  }
}
