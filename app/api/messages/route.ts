import { NextResponse } from "next/server";
import {
  getAllMessages,
  insertMessage,
  deleteMessage,
  initializeDatabase,
} from "../../../lib/db";

// Initialize database on first request
initializeDatabase();

// GET - Retrieve all messages from database
// Returns all messages stored in SQLite database
export async function GET() {
  try {
    const messages = getAllMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error in GET /api/messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add a new message to database
// Stores a new message with sender and receiver IDs in SQLite
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = (body.text || "").trim();
    const senderId = (body.senderId || "").trim();
    const receiverId = (body.receiverId || "").trim();

    // Validate required fields
    if (!text) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }
    if (!senderId) {
      return NextResponse.json(
        { error: "Sender ID is required" },
        { status: 400 }
      );
    }
    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    // Generate unique message ID
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    // Insert message into database and return it
    const newMessage = insertMessage(messageId, text, senderId, receiverId, createdAt);

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error in POST /api/messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove a message from database
// Deletes a message by its ID from SQLite database
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Delete message from database
    const deleted = deleteMessage(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Return remaining messages
    const messages = getAllMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error in DELETE /api/messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
