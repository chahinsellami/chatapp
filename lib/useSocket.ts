"use client";

/**
 * Backward-compatible wrapper around the global SocketContext.
 *
 * All pages that previously called `useSocket(userId)` continue to work
 * unchanged — they just consume the single global socket from SocketProvider
 * instead of creating their own connection.
 *
 * The `userId` parameter is kept for API compatibility but is now ignored;
 * the SocketProvider gets the user from AuthContext automatically.
 */

import { useSocketContext } from "@/context/SocketContext";

// Re-export the context hook under the old name so existing imports work
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useSocket(_userId?: string | null) {
  return useSocketContext();
}
