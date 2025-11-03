import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { initializeDatabase } from "../../../lib/db";
import { extractTokenFromHeader, verifyToken } from "../../../lib/auth";

// Get database connection
function getDatabase(): Database.Database {
  const DB_PATH = path.join(process.cwd(), ".data", "webchat.db");
  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");
  return db;
}

// GET - Retrieve messages for a specific channel
// Returns messages with user information
export async function GET(request: NextRequest) {
  try {
    initializeDatabase();

    // Get channel ID from query params
    const channelId =
      request.nextUrl.searchParams.get("channelId") || "general";

    // Get and verify auth token
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();

    // Query messages with user info
    const messages = db
      .prepare(
        `
        SELECT 
          m.id,
          m.text,
          m.userId,
          u.username,
          u.avatar,
          m.channelId,
          m.createdAt
        FROM messages m
        LEFT JOIN users u ON m.userId = u.id
        WHERE m.channelId = ?
        ORDER BY m.createdAt ASC
        `
      )
      .all(channelId) as any[];

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error in GET /api/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add a new message to a channel
// Stores message with authenticated user ID
export async function POST(request: NextRequest) {
  try {
    initializeDatabase();

    // Get and verify auth token
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);
    const tokenData = token ? verifyToken(token) : null;

    if (!tokenData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, channelId } = body;

    // Validate required fields
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Generate unique message ID
    const messageId = `msg-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    // Insert message
    db.prepare(
      `
      INSERT INTO messages (id, text, userId, channelId, createdAt)
      VALUES (?, ?, ?, ?, ?)
      `
    ).run(messageId, text.trim(), tokenData.userId, channelId, createdAt);

    // Get user info for response
    const user = db
      .prepare("SELECT username, avatar FROM users WHERE id = ?")
      .get(tokenData.userId) as any;

    // Return the new message with user info
    const newMessage = {
      id: messageId,
      text: text.trim(),
      userId: tokenData.userId,
      username: user?.username || "Unknown",
      avatar: user?.avatar,
      channelId,
      createdAt,
    };

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
