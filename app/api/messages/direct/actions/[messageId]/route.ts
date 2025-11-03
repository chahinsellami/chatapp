import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, createErrorResponse } from "@/lib/auth";
import {
  updateDirectMessage,
  deleteDirectMessage,
  initializeDatabase,
} from "@/lib/db";

/**
 * PUT /api/messages/direct/actions/[messageId]
 * Edit a direct message
 * Body: { text: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { messageId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!messageId) {
      return createErrorResponse("Message ID is required");
    }

    if (!text || text.trim().length === 0) {
      return createErrorResponse("Message text is required");
    }

    updateDirectMessage(messageId, text);

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Update direct message error:", error);
    return createErrorResponse("Failed to update message", 500);
  }
}

/**
 * DELETE /api/messages/direct/actions/[messageId]
 * Delete a direct message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    initializeDatabase();

    const user = authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { messageId } = await params;

    if (!messageId) {
      return createErrorResponse("Message ID is required");
    }

    deleteDirectMessage(messageId);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete direct message error:", error);
    return createErrorResponse("Failed to delete message", 500);
  }
}
