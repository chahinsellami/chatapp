import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import {
  getDirectMessages,
  insertDirectMessage,
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
    console.error("Get direct messages error:", error);
    return createErrorResponse("Failed to fetch messages", 500);
  }
}

/**
 * POST /api/messages/direct/[userId]
 * Send a direct message to another user
 * Body: { text: string }
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

    const id = crypto.randomUUID();
    const message = await insertDirectMessage(id, user.userId, receiverId, text);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Send direct message error:", error);
    return createErrorResponse("Failed to send message", 500);
  }
}
