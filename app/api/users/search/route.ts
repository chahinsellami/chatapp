import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import { initializeDatabase, searchUsers } from "@/lib/postgres";

/**
 * GET /api/users/search?q=query
 * Search for users by username or email
 * Returns users matching the query (excluding current user)
 */
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Use database ILIKE query for efficient search
    const results = await searchUsers(query, user.userId);

    return NextResponse.json({ users: results });
  } catch (error) {
    console.error("User search error:", error);
    return createErrorResponse("Failed to search users", 500);
  }
}
