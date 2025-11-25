/**
 * Fix User Avatar API - Reset avatar to emoji if it's a URL
 */

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Reset avatar to a default emoji if it's a URL
    await pool.query(
      `UPDATE users 
       SET avatar = '🎭' 
       WHERE id = $1 AND (avatar LIKE 'http%' OR avatar LIKE '%upload%')`,
      [decoded.userId]
    );

    // Get updated user
    const result = await pool.query(
      "SELECT username, avatar FROM users WHERE id = $1",
      [decoded.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Avatar reset to emoji",
      user: result.rows[0],
    });
  } catch (error) {
    // Error fixing avatar: (error)
    return NextResponse.json(
      { error: "Failed to fix avatar" },
      { status: 500 }
    );
  }
}
