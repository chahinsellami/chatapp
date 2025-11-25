import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/postgres";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * GET /api/posts - Get all posts or posts by a specific user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let query;
    let values;

    if (userId) {
      // Get posts from a specific user
      query = `
        SELECT p.*, u.username, u.avatar 
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
      `;
      values = [userId];
    } else {
      // Get posts from user's friends
      query = `
        SELECT p.*, u.username, u.avatar 
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN friendships f ON (
          (f.user_id = $1 AND f.friend_id = p.user_id) OR
          (f.friend_id = $1 AND f.user_id = p.user_id)
        )
        WHERE f.status = 'accepted'
        ORDER BY p.created_at DESC
        LIMIT 50
      `;
      values = [decoded.userId];
    }

    const result = await pool.query(query, values);

    return NextResponse.json({ posts: result.rows });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts - Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const body = await request.json();
    const { content, imageUrl } = body;

    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: "Post must have content or an image" },
        { status: 400 }
      );
    }

    const postId = crypto.randomUUID();
    const query = `
      INSERT INTO posts (id, user_id, content, image, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      postId,
      decoded.userId,
      content || null,
      imageUrl || null,
    ]);

    // Get user info for the response
    const userQuery = `SELECT username, avatar FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [decoded.userId]);

    const post = {
      ...result.rows[0],
      username: userResult.rows[0].username,
      avatar: userResult.rows[0].avatar,
    };

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
