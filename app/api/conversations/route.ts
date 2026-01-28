import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import { getConversations, initializeDatabase } from "@/lib/postgres";

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user
 * Returns list of conversations with latest message info and participant details
 */
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const conversations = await getConversations(user.userId);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return createErrorResponse("Failed to fetch conversations", 500);
  }
}
