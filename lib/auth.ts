/**
 * Authentication utilities for user management
 * Provides password hashing, JWT token handling, and input validation
 * Used across the application for secure user authentication
 */

import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

// JWT configuration - in production, use strong environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_EXPIRATION = "7d"; // Tokens expire after 7 days

// ============================================================================
// PASSWORD HASHING - Secure password storage and verification
// ============================================================================

/**
 * Hash a plain text password using bcrypt for secure storage
 * Uses salt rounds of 10 for good security/performance balance
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with its hashed version
 * Used during login to verify user credentials
 * @param password - Plain text password from user input
 * @param hash - Hashed password from database
 * @returns True if password matches, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// JWT TOKENS - Stateless authentication using JSON Web Tokens
// ============================================================================

/**
 * Interface defining the structure of JWT payload
 * Contains essential user information for authentication
 */
export interface TokenPayload {
  userId: string; // Unique user identifier
  username: string; // User's display name
  email: string; // User's email address
}

/**
 * Create a signed JWT token for user authentication
 * Token contains user info and expires after configured time
 * @param payload - User information to encode in token
 * @returns Signed JWT token string
 */
export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

/**
 * Verify and decode a JWT token
 * Checks token signature and expiration
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid, null if invalid/expired
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Extract JWT token from HTTP Authorization header
 * Supports "Bearer <token>" format as per OAuth 2.0 standard
 * @param authHeader - Authorization header value
 * @returns Token string if valid format, null otherwise
 */
export function extractTokenFromHeader(
  authHeader: string | undefined | null
): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null; // Invalid format
  }

  return parts[1];
}

// ============================================================================
// INPUT VALIDATION - Ensure user data meets security requirements
// ============================================================================

/**
 * Validate password strength requirements
 * Enforces security best practices for password creation
 * Requirements: 8+ chars, uppercase, lowercase, number
 * @param password - Password to validate
 * @returns Validation result with errors if any
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email address format using regex
 * Checks for basic email structure: user@domain.tld
 * @param email - Email address to validate
 * @returns True if valid email format, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username requirements
 * Ensures usernames are reasonable length and contain only safe characters
 * Requirements: 3-20 chars, alphanumeric + underscores only
 * @param username - Username to validate
 * @returns Validation result with errors if any
 */
export function validateUsername(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push("Username must be at least 3 characters");
  }

  if (username.length > 20) {
    errors.push("Username must be at most 20 characters");
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// MIDDLEWARE HELPERS - API route authentication utilities
// ============================================================================

/**
 * Authenticate a request by extracting and verifying JWT token
 * Used in API routes to ensure user is authenticated
 * @param request - Incoming HTTP request
 * @returns User payload if authenticated, null if not
 */
export function authenticateRequest(request: Request): TokenPayload | null {
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null; // No token provided
  }

  return verifyToken(token);
}

/**
 * Create a standardized error response for API routes
 * @param message - Error message to send to client
 * @param status - HTTP status code (default 400)
 * @returns Response object with error JSON
 */
export function createErrorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Create a successful authentication response
 * Includes user data and sets HttpOnly cookie with JWT token
 * @param user - User object from database
 * @param token - JWT token for the user
 * @param status - HTTP status code (default 200)
 * @returns Response with user data and auth cookie
 */
export function createAuthResponse(
  user: any,
  token: string,
  status: number = 200
) {
  return Response.json(
    {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.cover_image,
        status: user.status,
        bio: user.bio,
      },
      token,
    },
    {
      status,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`,
      },
    }
  );
}
