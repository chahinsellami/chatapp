import { NextRequest } from "next/server";
import { getUserByEmail, initializeDatabase } from "@/lib/db";
import {
  comparePassword,
  createToken,
  createErrorResponse,
  createAuthResponse,
} from "@/lib/auth";

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database
    initializeDatabase();

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return createErrorResponse("Email and password required");
    }

    // Find user by email
    const user = getUserByEmail(email);
    if (!user) {
      return createErrorResponse("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return createErrorResponse("Invalid email or password");
    }

    // Create JWT token
    const token = createToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // Return success response with token
    return createAuthResponse(user, token);
  } catch (error) {
    console.error("Login error:", error);
    return createErrorResponse("Failed to login", 500);
  }
}
