import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import {
  getDirectMessages,
  insertDirectMessage,
  getOrCreateConversation,
  initializeDatabase,
} from "@/lib/postgres";

/**
 * GET /api/messages/direct/[userId]
 * Get direct message history with another user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { userId: otherUserId } = await params;

    if (!otherUserId) {
      return createErrorResponse("User ID is required");
    }

    const messages = await getDirectMessages(user.userId, otherUserId);

    return NextResponse.json({ messages });
  } catch (error) {
    return createErrorResponse("Failed to fetch messages", 500);
  }
}

/**
 * POST /api/messages/direct/[userId]
 * Send a direct message to another user
 * Body: { text: string }
 *
 * Note: Messages are stored regardless of whether the recipient is online or not.
 * This allows for offline message delivery when they reconnect.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { userId: receiverId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!receiverId) {
      return createErrorResponse("Receiver ID is required");
    }

    if (!text || text.trim().length === 0) {
      return createErrorResponse("Message text is required");
    }

    if (receiverId === user.userId) {
      return createErrorResponse("Cannot send message to yourself");
    }

    // Note: We don't check if receiver exists here because:
    // 1. Messages should be stored for offline delivery
    // 2. Users might be deleted but their message history should remain
    // 3. We only check if they're a valid friend at the UI level

    const id = crypto.randomUUID();
    try {
      // Create or update conversation record
      await getOrCreateConversation(user.userId, receiverId);
      
      const message = await insertDirectMessage(
        id,
        user.userId,
        receiverId,
        text
      );

      return NextResponse.json(message, { status: 201 });
    } catch (dbError: any) {
      // If foreign key constraint fails, it means receiver doesn't exist in users table
      if (dbError.code === "23503") {
        return createErrorResponse("Recipient user not found", 404);
      }
      throw dbError;
    }
  } catch (error) {
    // Send direct message error: (error)
    return createErrorResponse("Failed to send message", 500);
  }
}
