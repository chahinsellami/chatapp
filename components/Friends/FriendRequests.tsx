"use client";

/**
 * Friend Requests Component
 * Displays pending friend requests received by the user
 * Allows accepting or rejecting friend requests
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, User } from "lucide-react";

interface FriendRequest {
  id: string;
  sender_id: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  created_at: string;
}

interface Props {
  userId: string;
}

export default function FriendRequests({ userId }: Props) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Fetch pending friend requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/friends");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch friend requests");
      }

      setRequests(data.pendingRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
    // Only refresh when user comes back to window (not constantly)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchRequests();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Handle accepting a friend request
  const handleAccept = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const response = await fetch(
        `/api/friends/requests/${requestId}?action=accept`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept request");
      }

      // Remove the request from the list
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept request"
      );
    } finally {
      setProcessing(null);
    }
  };

  // Handle rejecting a friend request
  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const response = await fetch(
        `/api/friends/requests/${requestId}?action=reject`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      // Remove the request from the list
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject request"
      );
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center">
        <div className="text-slate-400">Loading friend requests...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No Friend Requests
        </h3>
        <p className="text-sm text-slate-400">
          You have no pending friend requests
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-6 rounded-2xl"
    >
      <h3 className="text-lg font-bold text-white mb-4">
        Friend Requests ({requests.length})
      </h3>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  {request.sender.avatar ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-base">
                      {request.sender.avatar}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {request.sender.username}
                  </p>
                  <p className="text-xs text-slate-400">
                    Sent {formatDate(request.created_at)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <motion.button
                  onClick={() => handleAccept(request.id)}
                  disabled={processing === request.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Accept request"
                >
                  <Check className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  title="Reject request"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Format relative date (e.g., "2 minutes ago")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
