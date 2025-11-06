import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/postgres";

/**
 * GET /api/users/[userId]
 * Fetch a specific user's profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { userId } = await params;

    // Fetch user profile from database
    const result = await pool.query(
      `SELECT id, username, email, avatar, cover_image, bio, status, created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        cover_image: user.cover_image,
        bio: user.bio,
        status: user.status || "online",
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
