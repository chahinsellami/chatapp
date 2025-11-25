import Image from "next/image";
"use client";

/**
 * Friends List Component - Displays user's friends and pending friend requests
 *
 * Features:
 * - Real-time online status indicators via Socket.IO
 * - Collapsible pending requests section
 * - Accept/reject friend requests
 * - Remove friends with confirmation
 * - Animated list with smooth transitions
 * - Modern glassmorphism UI with hover effects
 */

import { useState, useEffect } from "react";
import { useSocket } from "@/lib/useSocket"; // Socket.IO hook for real-time features
import { motion, AnimatePresence } from "framer-motion"; // Animation library
import {
  Users,
  UserPlus,
  UserMinus,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"; // Icon components

/**
 * Friend data structure
 */
interface Friend {
  id: string; // Unique friend identifier
  username: string; // Friend's display name
  avatar?: string; // Friend's avatar (emoji or image URL)
  status: string; // Friend's status (online, idle, dnd, invisible)
  createdAt: string; // When friendship was created
}

/**
 * Pending friend request data structure
 */
interface PendingRequest {
  id: string; // Unique request identifier
  senderId: string; // ID of user who sent the request
  username: string; // Sender's display name
  avatar?: string; // Sender's avatar
  createdAt: string; // When request was sent
}

/**
 * Props interface for FriendsList component
 */
interface FriendsListProps {
  userId: string; // Current user's ID
  onSelectFriend?: (friendId: string, friendData?: Friend) => void; // Callback when friend is clicked
  onRefresh?: () => void; // Callback to refresh parent component data
}

/**
 * Friends List Component
 * Main component for managing friends and friend requests
 */
export default function FriendsList({
  userId,
  onSelectFriend,
  onRefresh,
}: FriendsListProps) {
  // State management for friends data
  const [friends, setFriends] = useState<Friend[]>([]); // Array of accepted friends
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]); // Array of pending incoming requests
  const [loading, setLoading] = useState(true); // Initial data loading state
  const [error, setError] = useState<string | null>(null); // Error message for display
  const [expandPending, setExpandPending] = useState(false); // Toggle for pending requests section
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which action is loading (by ID)

  // Get online users set from Socket.IO connection
  const { onlineUsers } = useSocket(userId);

  /**
   * Fetch friends and pending requests on component mount
   */
  useEffect(() => {
    fetchFriends();
  }, [userId]);

  /**
   * Fetch friends and pending requests from server
   * Retrieves both accepted friends and incoming friend requests
   */
  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token from local storage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      // Make API request to get friends data
      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch friends");

      // Parse and set friends data
      const data = await res.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching friends");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Accept a pending friend request
   * Updates the friend request status to 'accepted' and refreshes the list
   *
   * @param requestId - ID of the friend request to accept
   */
  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId); // Show loading state for this specific request
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // Make API call to accept the request
      const res = await fetch(
        `/api/friends/requests/${requestId}?action=accept`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to accept request");

      // Refresh friends list and notify parent component
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error accepting request");
    } finally {
      setActionLoading(null); // Clear loading state
    }
  };

  /**
   * Reject a pending friend request
   * Deletes the friend request and refreshes the list
   *
   * @param requestId - ID of the friend request to reject
   */
  const handleRejectRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId); // Show loading state for this specific request
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // Make API call to reject the request
      const res = await fetch(
        `/api/friends/requests/${requestId}?action=reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to reject request");

      // Refresh friends list and notify parent component
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error rejecting request");
    } finally {
      setActionLoading(null); // Clear loading state
    }
  };

  /**
   * Remove a friend from the user's friend list
   * Shows confirmation dialog before removing
   *
   * @param friendId - ID of the friend to remove
   */
  const handleRemoveFriend = async (friendId: string) => {
    // Show confirmation dialog to prevent accidental removal
    if (!confirm("Remove this friend?")) return;

    try {
      setActionLoading(friendId); // Show loading state for this specific friend
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // Make API call to remove the friend
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to remove friend");

      // Refresh friends list and notify parent component
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing friend");
    } finally {
      setActionLoading(null); // Clear loading state
    }
  };

  /**
   * Loading State UI
   * Displays animated spinner while fetching initial data
   */

  /**
   * Loading State UI
   * Displays animated spinner while fetching initial data
   */
  if (loading) {
    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="text-center">
          {/* Rotating icon spinner */}
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-blue-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-neutral-400 text-lg font-medium">
            Loading friends...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  /**
   * Main Component Render
   * Displays friends list with header, error messages, pending requests, and friends
   */
  return (
    <motion.div
      className="flex-1 flex flex-col glass-card m-2 relative overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div
        className="flex items-center gap-3 p-6 border-b border-neutral-800 backdrop-blur-sm bg-neutral-950/50 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Icon with blue background */}
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600"
          whileHover={{ scale: 1.05 }}
        >
          <Users className="w-5 h-5 text-white" />
        </motion.div>

        {/* Header text */}
        <div>
          <h2 className="text-white font-bold text-lg">Friends</h2>
          <p className="text-neutral-400 text-sm">
            {friends.length} friend{friends.length !== 1 ? "s" : ""}
          </p>
        </div>
      </motion.div>

      {/* Error Message Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mx-6 mt-4 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm relative z-10"
            style={{ background: "rgba(220, 38, 38, 0.1)" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Requests Section (collapsible) */}
      {pendingRequests.length > 0 && (
        <motion.div
          className="border-b border-white/10 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Collapsible header button */}
          <motion.button
            onClick={() => setExpandPending(!expandPending)}
            className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors flex items-center gap-3 group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Chevron icon that rotates when expanded */}
            <motion.div
              animate={{ rotate: expandPending ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {expandPending ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
            </motion.div>

            {/* Section title with badge */}
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium text-sm">
                Pending Requests
              </span>
              {/* Badge showing count */}
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                {pendingRequests.length}
              </span>
            </div>
          </motion.button>

          {/* Collapsible content - pending requests list */}
          <AnimatePresence>
            {expandPending && (
              <motion.div
                className="px-6 pb-4 space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Map through pending requests */}
                {pendingRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    className="p-4 rounded-xl glass-card hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Request user info */}
                    <div className="flex items-center gap-3 mb-3">
                      {/* Avatar */}
                      <motion.div
                        className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-neutral-700"
                        whileHover={{ scale: 1.05 }}
                      >
                        {request.avatar &&
                        (request.avatar.startsWith("http") ||
                          request.avatar.startsWith("/")) ? (
                          <Image
                            src={request.avatar}
                            alt={request.username}
                            className="w-full h-full object-cover"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <span className="text-white text-sm font-bold">
                            {request.avatar ||
                              request.username[0].toUpperCase()}
                          </span>
                        )}
                      </motion.div>

                      {/* Username and timestamp */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {request.username}
                        </p>
                        <p className="text-neutral-400 text-xs">
                          Sent{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons - Accept/Reject */}
                    <div className="flex gap-2">
                      {/* Accept button */}
                      <motion.button
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 py-2 px-4 rounded-lg font-medium text-white text-sm bg-green-600 hover:bg-green-700 transition-colors relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {actionLoading === request.id ? (
                            // Loading spinner
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Accept
                            </>
                          )}
                        </div>
                      </motion.button>

                      {/* Reject button */}
                      <motion.button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 py-2 px-4 rounded-lg font-medium text-white text-sm bg-red-600 hover:bg-red-700 transition-colors relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {actionLoading === request.id ? (
                            // Loading spinner
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Reject
                            </>
                          )}
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Friends List Section */}
      <div className="flex-1 overflow-y-auto p-6 pb-8 space-y-3 min-h-0 relative z-10 hide-scrollbar" style={{scrollBehavior: 'smooth', maxHeight: 'calc(100vh - 180px)'}}>
        <AnimatePresence>
          {/* Empty state - no friends */}
          {friends.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Animated icon */}
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-neutral-800"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Users className="w-8 h-8 text-neutral-400" />
              </motion.div>
              {/* Empty state text */}
              <h3 className="text-white font-medium mb-2">No friends yet</h3>
              <p className="text-neutral-400 text-sm">
                Add someone to start chatting!
              </p>
            </motion.div>
          ) : (
            /* Friends list - map through friends array */
            friends.map((friend, index) => (
              <motion.div
                key={friend.id}
                className="p-4 rounded-xl glass-card hover:bg-neutral-800/50 transition-colors cursor-pointer group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectFriend?.(friend.id, friend)}
              >
                <div className="flex items-center gap-4 relative z-10">
                  {/* Friend avatar with online indicator */}
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-blue-600">
                      {friend.avatar &&
                      (friend.avatar.startsWith("http") ||
                        friend.avatar.startsWith("/")) ? (
                        <Image
                          src={friend.avatar}
                          alt={friend.username}
                          className="w-full h-full object-cover"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {friend.avatar || friend.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Online status indicator - animated pulsing dot */}
                    <motion.div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                        onlineUsers.has(friend.id)
                          ? "bg-green-400"
                          : "bg-neutral-500"
                      }`}
                      animate={
                        onlineUsers.has(friend.id)
                          ? {
                              scale: [1, 1.2, 1],
                              boxShadow: [
                                "0 0 0 0 rgba(34, 197, 94, 0.7)",
                                "0 0 0 4px rgba(34, 197, 94, 0)",
                                "0 0 0 0 rgba(34, 197, 94, 0)",
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Friend name and status */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-base truncate">
                      {friend.username}
                    </h3>
                    <p className="text-neutral-400 text-sm flex items-center gap-2">
                      {onlineUsers.has(friend.id) ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Online</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                          <span>Offline</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Remove friend button - appears on hover */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering friend selection
                      handleRemoveFriend(friend.id);
                    }}
                    disabled={actionLoading === friend.id}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {actionLoading === friend.id ? (
                      // Loading spinner
                      <motion.div
                        className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <UserMinus className="w-4 h-4 text-red-400" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
