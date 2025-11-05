import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// In-memory store for typing status (not persisted to file)
// In production, this would be in a database or Redis
const typingStatus: {
  [key: string]: {
    userId: string;
    conversationId: string;
    expiresAt: number;
  };
} = {};

// Clean up expired typing indicators (older than 3 seconds)
function cleanupExpiredStatus() {
  const now = Date.now();
  Object.keys(typingStatus).forEach((key) => {
    if (typingStatus[key].expiresAt < now) {
      delete typingStatus[key];
    }
  });
}

// GET - Retrieve current typing status for a conversation
// This endpoint returns which users are currently typing in a specific conversation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Clean up any expired typing indicators
    cleanupExpiredStatus();

    // Filter typing status for this specific conversation
    const typingUsers = Object.values(typingStatus)
      .filter((status) => status.conversationId === conversationId)
      .map((status) => status.userId);

    return NextResponse.json({ typingUsers });
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Update typing status for a user
// This endpoint is called when a user starts typing
// The typing indicator expires after 3 seconds unless refreshed
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, conversationId, isTyping } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Create a unique key for this user's typing status
    const statusKey = `${userId}-${conversationId}`;

    // If user is typing, set their status with a 3-second expiration
    if (isTyping) {
      typingStatus[statusKey] = {
        userId,
        conversationId,
        expiresAt: Date.now() + 3000, // Expires in 3 seconds
      };
    } else {
      // If user stopped typing, remove their status
      delete typingStatus[statusKey];
    }

    // Clean up any expired typing indicators
    cleanupExpiredStatus();

    // Return the updated list of typing users
    const typingUsers = Object.values(typingStatus)
      .filter((status) => status.conversationId === conversationId)
      .map((status) => status.userId);

    return NextResponse.json({ typingUsers });
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Clear typing status for a user
// This endpoint is called when a user stops typing or leaves
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId, conversationId } = body;

    if (!userId || !conversationId) {
      return NextResponse.json(
        { error: "User ID and Conversation ID are required" },
        { status: 400 }
      );
    }

    // Remove the user's typing status
    const statusKey = `${userId}-${conversationId}`;
    delete typingStatus[statusKey];

    // Clean up any expired typing indicators
    cleanupExpiredStatus();

    // Return the updated list of typing users
    const typingUsers = Object.values(typingStatus)
      .filter((status) => status.conversationId === conversationId)
      .map((status) => status.userId);

    return NextResponse.json({ typingUsers });
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
