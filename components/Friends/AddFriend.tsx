"use client";

/**
 * Add Friend Component - Search and send friend requests to other users
 * Features real-time search, modern glassmorphism UI, and animated interactions
 * with loading states and success feedback
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  Check,
  AlertCircle,
  Users,
  Loader2,
} from "lucide-react";

/**
 * User data structure for search results
 */
interface User {
  id: string; // Unique user identifier
  username: string; // User's display name
  avatar?: string; // User's avatar (emoji or image URL)
  status: string; // User's current status
}

/**
 * Props interface for AddFriend component
 */
interface AddFriendProps {
  userId: string; // Current user's ID
  onFriendAdded?: () => void; // Callback when friend request is sent successfully
}

/**
 * Add Friend Component
 * Allows users to search for other users and send friend requests
 */
export default function AddFriend({ userId, onFriendAdded }: AddFriendProps) {
  // Search and UI state management
  const [searchTerm, setSearchTerm] = useState(""); // Current search input
  const [users, setUsers] = useState<User[]>([]); // Search results
  const [loading, setLoading] = useState(false); // General loading state
  const [searching, setSearching] = useState(false); // Search operation loading
  const [error, setError] = useState<string | null>(null); // Error message display
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set()); // Track sent requests
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success feedback

  // Auto-search when search term changes (debounced)
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
      setError(null);
    }
  }, [searchTerm]);

  /**
   * Search for users by username
   * Queries the server for users matching the search term
   */
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchTerm)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to search users");
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error searching users");
    } finally {
      setSearching(false);
    }
  };

  /**
   * Send a friend request to another user
   * Creates a new friend request relationship
   */
  const handleSendFriendRequest = async (recipientId: string) => {
    try {
      setError(null);
      setLoading(true);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch("/api/friends", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: recipientId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to send friend request");
      }

      // Add to sent requests and show success
      setSentRequests((prev) => new Set([...prev, recipientId]));
      setSuccessMessage("Friend request sent!");

      // Notify parent component
      onFriendAdded?.();

      // Clear success message and reset search after delay
      setTimeout(() => {
        setSuccessMessage(null);
        setSearchTerm("");
        setUsers([]);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error sending request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="glass-card m-2 p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-6 relative z-10"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600"
          whileHover={{ scale: 1.05 }}
        >
          <UserPlus className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-white font-bold text-lg">Add Friend</h3>
          <p className="text-neutral-400 text-sm">
            Find and connect with other users
          </p>
        </div>
      </motion.div>

      {/* Search Input */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username..."
            className="w-full pl-12 pr-4 py-3 modern-input focus-ring text-sm"
          />
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="mb-4 p-4 rounded-xl border border-green-500/20 backdrop-blur-sm relative z-10"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm font-medium">
                {successMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mb-4 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm relative z-10"
            style={{
              background: "rgba(220, 38, 38, 0.1)",
            }}
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

      {/* Search Results */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {searching && (
            <motion.div
              className="flex flex-col items-center justify-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="searching"
            >
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-6 h-6 text-white" />
              </motion.div>
              <p className="text-neutral-300 text-sm">Searching users...</p>
            </motion.div>
          )}

          {users.length > 0 && !searching && (
            <motion.div
              className="space-y-3 max-h-64 overflow-y-auto modern-scrollbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="results"
            >
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  className="p-4 rounded-xl glass-card hover:bg-white/5 transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-blue-600"
                      whileHover={{ scale: 1.05 }}
                    >
                      {user.avatar?.startsWith("/avatars/") ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {user.avatar || user.username[0].toUpperCase()}
                        </span>
                      )}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-base truncate">
                        {user.username}
                      </h4>
                      <p className="text-neutral-400 text-sm capitalize flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.status === "online"
                              ? "bg-green-400"
                              : user.status === "away"
                              ? "bg-yellow-400"
                              : "bg-neutral-500"
                          }`}
                        />
                        {user.status}
                      </p>
                    </div>

                    <motion.button
                      onClick={() => handleSendFriendRequest(user.id)}
                      disabled={sentRequests.has(user.id) || loading}
                      className={`px-4 py-2 rounded-lg font-medium text-white text-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                        sentRequests.has(user.id)
                          ? "bg-green-600"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : sentRequests.has(user.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Sent
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Add
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {searchTerm && users.length === 0 && !searching && (
            <motion.div
              className="flex flex-col items-center justify-center py-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="no-results"
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-neutral-800"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Users className="w-8 h-8 text-neutral-400" />
              </motion.div>
              <h4 className="text-white font-medium mb-2">No users found</h4>
              <p className="text-neutral-400 text-sm">
                Try searching with a different username
              </p>
            </motion.div>
          )}

          {!searchTerm && (
            <motion.div
              className="flex flex-col items-center justify-center py-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="empty"
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-blue-600"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-8 h-8 text-white" />
              </motion.div>
              <h4 className="text-white font-medium mb-2">
                Search for friends
              </h4>
              <p className="text-neutral-400 text-sm">
                Start typing a username to find people to connect with
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
