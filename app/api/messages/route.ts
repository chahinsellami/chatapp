import { NextRequest, NextResponse } from "next/server";
import {
  initializeDatabase,
  insertMessage,
  getMessagesByChannelId,
} from "../../../lib/postgres";
import { extractTokenFromHeader, verifyToken } from "../../../lib/auth";

// GET - Retrieve messages for a specific channel
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const channelId =
      request.nextUrl.searchParams.get("channelId") || "general";

    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await getMessagesByChannelId(channelId);
    return NextResponse.json(messages);
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add a new message to a channel
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);
    const tokenData = token ? verifyToken(token) : null;

    if (!tokenData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, channelId } = body;

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

    const messageId = `msg-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const message = await insertMessage(
      messageId,
      text.trim(),
      tokenData.userId,
      channelId
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
