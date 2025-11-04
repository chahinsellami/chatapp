"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  avatar?: string;
  status: string;
}

interface AddFriendProps {
  userId: string;
  onFriendAdded?: () => void;
}

export default function AddFriend({ userId, onFriendAdded }: AddFriendProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // Auto-search when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const token = localStorage.getItem("token");
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
      console.error("Error searching users:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (recipientId: string) => {
    try {
      setError(null);

      const token = localStorage.getItem("token");
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

      // Add to sent requests
      setSentRequests((prev) => new Set([...prev, recipientId]));

      // Notify parent
      onFriendAdded?.();

      // Show success message
      setTimeout(() => {
        setSearchTerm("");
        setUsers([]);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error sending request");
      console.error("Error sending friend request:", err);
    }
  };

  return (
    <div className="bg-[#2F3136] rounded-lg p-4 border border-[#202225]">
      <h3 className="text-[#DCDDDE] font-bold text-sm mb-3">👥 Add Friend</h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search username..."
          className="w-full px-3 py-2 bg-[#40444B] text-[#DCDDDE] rounded-lg outline-none focus:ring-2 focus:ring-[#5B65F5] placeholder-[#72767D] text-sm"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-500 bg-opacity-20 text-red-300 text-xs rounded">
          {error}
        </div>
      )}

      {/* Search Results */}
      {searching && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5B65F5]"></div>
        </div>
      )}

      {users.length > 0 && !searching && (
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 p-2 bg-[#35373B] rounded-lg hover:bg-[#3C3F45] transition"
            >
              <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#DCDDDE] truncate">
                  {user.username}
                </p>
                <p className="text-xs text-[#72767D] capitalize">
                  {user.status}
                </p>
              </div>
              <button
                onClick={() => handleSendFriendRequest(user.id)}
                disabled={sentRequests.has(user.id)}
                className="px-3 py-1 text-xs bg-[#5B65F5] hover:bg-opacity-80 disabled:bg-opacity-50 text-white rounded transition font-medium"
              >
                {sentRequests.has(user.id) ? "✓ Sent" : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}

      {searchTerm && users.length === 0 && !searching && (
        <div className="py-4 text-center text-[#72767D] text-xs">
          No users found
        </div>
      )}

      {!searchTerm && (
        <div className="py-4 text-center text-[#72767D] text-xs">
          Start typing to search for users
        </div>
      )}
    </div>
  );
}
