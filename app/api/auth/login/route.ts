import { NextRequest } from "next/server";
import { getUserByEmail, initializeDatabase } from "@/lib/postgres";
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
    try {
      await initializeDatabase();
    } catch (dbError) {
      
      return createErrorResponse(
        "Database is not available. Please try again later.",
        503
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return createErrorResponse("Email and password required");
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return createErrorResponse("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
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
    
    return createErrorResponse("Failed to login", 500);
  }
}
