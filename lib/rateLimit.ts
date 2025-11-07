/**
 * Rate Limiting Middleware for API Routes
 * Prevents abuse by limiting request frequency per user/IP
 * Uses in-memory storage (consider Redis for production with multiple servers)
 */

import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit storage
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Custom message when rate limit is exceeded
   */
  message?: string;

  /**
   * Key generator function (defaults to IP address)
   */
  keyGenerator?: (request: Request) => string;
}

/**
 * Default configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Authentication endpoints - strict limit to prevent brute force
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many login attempts. Please try again later.",
  },

  // API endpoints - general limit for most operations
  API: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many requests. Please slow down.",
  },

  // Message sending - moderate limit
  MESSAGES: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many messages sent. Please wait before sending more.",
  },

  // File uploads - strict limit due to resource usage
  UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Upload limit reached. Please try again later.",
  },

  // Search queries - moderate limit
  SEARCH: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many search requests. Please slow down.",
  },
} as const;

/**
 * Apply rate limiting to a request
 * @param request - Incoming request
 * @param config - Rate limit configuration
 * @returns NextResponse if rate limit exceeded, null otherwise
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig
): NextResponse | null {
  const key = config.keyGenerator
    ? config.keyGenerator(request)
    : getDefaultKey(request);

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or entry expired - create new
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);

    return NextResponse.json(
      {
        error: config.message || "Rate limit exceeded",
        retryAfter: resetIn,
      },
      {
        status: 429,
        headers: {
          "Retry-After": resetIn.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": entry.resetTime.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Get default rate limit key from request
 * Uses user ID from auth token if available, otherwise IP address
 * @param request - Incoming request
 * @returns Unique identifier for rate limiting
 */
function getDefaultKey(request: Request): string {
  // Try to get user ID from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // In production, decode JWT to get user ID
    // For now, use token hash as key
    const token = authHeader.substring(7);
    return `user:${hashString(token)}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  return `ip:${ip}`;
}

/**
 * Simple string hash function for generating keys
 * @param str - String to hash
 * @returns Hash code
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Helper to check rate limit and return response if exceeded
 * @param request - Request object
 * @param config - Rate limit config
 * @returns Response if rate limited, null otherwise
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): NextResponse | null {
  return rateLimit(request, config);
}

/**
 * Get current rate limit status for a key
 * Useful for displaying remaining requests to users
 * @param request - Request object
 * @param config - Rate limit config
 * @returns Rate limit status
 */
export function getRateLimitStatus(
  request: Request,
  config: RateLimitConfig
): {
  limit: number;
  remaining: number;
  reset: number;
} {
  const key = config.keyGenerator
    ? config.keyGenerator(request)
    : getDefaultKey(request);

  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry || entry.resetTime < now) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.windowMs,
    };
  }

  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    reset: entry.resetTime,
  };
}
