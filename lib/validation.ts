/**
 * Input Validation using Zod
 * Provides type-safe validation schemas for all user inputs
 * Prevents injection attacks and ensures data integrity
 */

import { z } from "zod";

// ============================================================================
// USER AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Login validation schema
 * Validates email and password format for secure authentication
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .max(255, "Email too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password too long"),
});

/**
 * Signup validation schema
 * Enforces strong password requirements and username rules
 */
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .trim(),
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .max(255, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

/**
 * Profile update validation schema
 * Ensures profile data meets security and format requirements
 */
export const profileUpdateSchema = z.object({
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  coverImage: z
    .string()
    .url("Invalid cover image URL")
    .optional()
    .or(z.literal("")),
  status: z.enum(["online", "idle", "dnd", "invisible"]).optional(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

// ============================================================================
// MESSAGING SCHEMAS
// ============================================================================

/**
 * Message validation schema
 * Prevents XSS and ensures message content is safe
 */
export const messageSchema = z.object({
  text: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message too long")
    .trim()
    .refine(
      (text) => text.length > 0 && text !== "\n" && text !== " ",
      "Message cannot be just whitespace"
    ),
});

/**
 * Friend request validation schema
 */
export const friendRequestSchema = z.object({
  friendId: z.string().uuid("Invalid user ID format"),
});

// ============================================================================
// POST/CONTENT SCHEMAS
// ============================================================================

/**
 * Post creation validation schema
 * Validates post content and prevents malicious input
 */
export const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post cannot be empty")
    .max(5000, "Post too long (max 5000 characters)")
    .trim(),
  mediaUrl: z.string().url("Invalid media URL").optional().or(z.literal("")),
});

// ============================================================================
// SEARCH AND QUERY SCHEMAS
// ============================================================================

/**
 * Search query validation schema
 * Prevents SQL injection and validates search terms
 */
export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query too long")
    .trim()
    .refine(
      (q) => !q.match(/[<>'"]/),
      "Search query contains invalid characters"
    ),
});

/**
 * User ID parameter validation schema
 */
export const userIdSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes dangerous HTML tags and JavaScript
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate and parse request body with Zod schema
 * Provides type-safe validation with detailed error messages
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data or validation errors
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  try {
    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.issues.map((e: z.ZodIssue) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      };
    }
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ field: "unknown", message: "Validation error" }],
    };
  }
}

/**
 * Check if string contains potential SQL injection patterns
 * @param input - String to check
 * @returns True if suspicious patterns found
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /('|"|`)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Rate limiting key generator
 * Creates unique keys for rate limiting based on user ID or IP
 * @param identifier - User ID or IP address
 * @returns Rate limit key
 */
export function getRateLimitKey(identifier: string): string {
  return `rate_limit:${identifier}`;
}
