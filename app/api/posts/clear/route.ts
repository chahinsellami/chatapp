/**
 * Clear Posts API - Delete all posts from database
 * DELETE /api/posts/clear - Admin endpoint to clear all posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function DELETE(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    jwt.verify(token, JWT_SECRET);

    // Delete all posts
    const result = await pool.query('DELETE FROM posts');

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.rowCount} posts`,
      deletedCount: result.rowCount
    });

  } catch (error) {
    console.error('Error clearing posts:', error);
    return NextResponse.json(
      { error: 'Failed to clear posts' },
      { status: 500 }
    );
  }
}
