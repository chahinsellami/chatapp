import { NextRequest } from "next/server";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  initializeDatabase,
} from "@/lib/db";
import {
  hashPassword,
  validateEmail,
  validateUsername,
  validatePasswordStrength,
  createToken,
  createErrorResponse,
  createAuthResponse,
} from "@/lib/auth";

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database
    try {
      initializeDatabase();
    } catch (dbError) {
      console.error("Database initialization failed:", dbError);
      return createErrorResponse(
        "Database is not available. Please try again later.",
        503
      );
    }

    const body = await request.json();
    const { username, email, password, passwordConfirm } = body;

    // ============================================================================
    // VALIDATION
    // ============================================================================

    // Check required fields
    if (!username || !email || !password || !passwordConfirm) {
      return createErrorResponse("All fields are required");
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return createErrorResponse(usernameValidation.errors.join(", "));
    }

    // Validate email
    if (!validateEmail(email)) {
      return createErrorResponse("Invalid email format");
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return createErrorResponse(passwordValidation.errors.join(", "));
    }

    // Check password confirmation
    if (password !== passwordConfirm) {
      return createErrorResponse("Passwords do not match");
    }

    // ============================================================================
    // CHECK FOR EXISTING USER
    // ============================================================================

    const existingUsername = getUserByUsername(username);
    if (existingUsername) {
      return createErrorResponse("Username already taken");
    }

    const existingEmail = getUserByEmail(email);
    if (existingEmail) {
      return createErrorResponse("Email already registered");
    }

    // ============================================================================
    // CREATE USER
    // ============================================================================

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate user ID
    const userId = `user-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create user in database
    const newUser = createUser(userId, username, email, passwordHash);

    // Create JWT token
    const token = createToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    // Return success response with token
    return createAuthResponse(newUser, token, 201);
  } catch (error) {
    console.error("Signup error:", error);
    return createErrorResponse("Failed to create account", 500);
  }
}
