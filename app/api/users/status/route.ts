import { NextRequest, NextResponse } from "next/server";
import { updateUserStatus } from "@/lib/postgres";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";

/**
 * PUT /api/users/status
 * Lightweight endpoint to update only the user's status field.
 * Used by the automatic presence system (online / idle / offline).
 *
 * Also supports sendBeacon() on page unload:
 *   sendBeacon sends a POST-like body but we read JSON from it.
 *   If Authorization header is missing, falls back to `token` in the body.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, token: bodyToken } = body;

    // Get token from header first, fall back to body (for sendBeacon)
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader) || bodyToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const validStatuses = ["online", "idle", "dnd", "invisible", "offline"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await updateUserStatus(decoded.userId, status);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST handler — same logic as PUT.
 * sendBeacon sometimes sends as POST, so we handle both.
 */
export async function POST(request: NextRequest) {
  return PUT(request);
}
