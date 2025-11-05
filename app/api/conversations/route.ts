import { NextResponse } from "next/server";
import { getAllMessages, initializeDatabase } from "../../../lib/db";

// Initialize database on first request
initializeDatabase();

// GET - Retrieve conversations grouped by user
// Loads all messages and groups them by conversation partners
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("currentUserId") || "current-user-1";

    // Get all messages from database
    const messages = getAllMessages();

    // Group messages by user conversations
    // A conversation is between the current user and another user
    const conversations: {
      [userId: string]: {
        userId: string;
        messages: any[];
      };
    } = {};

    messages.forEach((message: any) => {
      const { senderId, receiverId } = message;

      // Determine the other user in this conversation
      let otherUserId: string;
      if (senderId === currentUserId) {
        otherUserId = receiverId;
      } else if (receiverId === currentUserId) {
        otherUserId = senderId;
      } else {
        return; // Skip messages not involving current user
      }

      // Initialize conversation if not exists
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          userId: otherUserId,
          messages: [],
        };
      }

      // Add message to conversation
      conversations[otherUserId].messages.push(message);
    });

    return NextResponse.json(conversations);
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
