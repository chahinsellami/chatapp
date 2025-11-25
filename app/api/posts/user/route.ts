/**
 * User Posts API - Fetch posts for authenticated user
 *
 * GET /api/posts/user - Get all posts from the authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/postgres";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie or header
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Fetch user's posts with user information
    const result = await pool.query(
      `SELECT 
        p.id,
        p.user_id,
        p.content,
        p.image,
        p.likes,
        p.created_at,
        p.edited_at,
        u.username,
        u.avatar,
        u.status
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      posts: result.rows,
    });
  } catch (error) {
    // Error fetching posts: (error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
