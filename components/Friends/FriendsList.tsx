"use client";

import { useState, useEffect } from "react";

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: string;
  createdAt: string;
}

interface PendingRequest {
  id: string;
  senderId: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

interface FriendsListProps {
  userId: string;
  onSelectFriend?: (friendId: string) => void;
  onRefresh?: () => void;
}

export default function FriendsList({
  userId,
  onSelectFriend,
  onRefresh,
}: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandPending, setExpandPending] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch friends and pending requests
  useEffect(() => {
    fetchFriends();
  }, [userId]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data = await res.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching friends");
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch(
        `/api/friends/requests/${requestId}?action=accept`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to accept request");
      }

      // Refresh friends list
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error accepting request");
      console.error("Error accepting request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch(
        `/api/friends/requests/${requestId}?action=reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to reject request");
      }

      // Refresh friends list
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error rejecting request");
      console.error("Error rejecting request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("Remove this friend?")) return;

    try {
      setActionLoading(friendId);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to remove friend");
      }

      // Refresh friends list
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing friend");
      console.error("Error removing friend:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B65F5]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#2F3136] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#202225]">
        <h2 className="text-sm font-bold text-[#DCDDDE] uppercase tracking-wider">
          👥 Friends ({friends.length})
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-3 p-2 bg-red-500 bg-opacity-20 text-red-300 text-xs rounded">
          {error}
        </div>
      )}

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="border-b border-[#202225]">
          <button
            onClick={() => setExpandPending(!expandPending)}
            className="w-full px-4 py-3 text-left hover:bg-[#35373B] transition flex items-center gap-2"
          >
            <span className="text-[#72767D] text-xs font-bold">
              {expandPending ? "▼" : "▶"} PENDING REQUESTS (
              {pendingRequests.length})
            </span>
          </button>

          {expandPending && (
            <div className="space-y-2 px-3 pb-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-2 bg-[#35373B] rounded-lg hover:bg-[#3C3F45] transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">
                        {request.username[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-[#DCDDDE] truncate flex-1">
                      {request.username}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded transition"
                    >
                      {actionLoading === request.id ? "..." : "✓"}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white rounded transition"
                    >
                      {actionLoading === request.id ? "..." : "✕"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {friends.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#72767D] text-xs">
            <p>No friends yet. Add someone!</p>
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="p-2 rounded-lg hover:bg-[#35373B] transition cursor-pointer group"
              onClick={() => onSelectFriend?.(friend.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {friend.username[0].toUpperCase()}
                    </span>
                  </div>
                  {/* Status indicator */}
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2F3136] ${
                      friend.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#DCDDDE] truncate">
                    {friend.username}
                  </p>
                  <p className="text-xs text-[#72767D] capitalize">
                    {friend.status}
                  </p>
                </div>
              </div>

              {/* Remove friend button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFriend(friend.id);
                }}
                disabled={actionLoading === friend.id}
                className="w-full px-2 py-1 text-xs bg-red-500 bg-opacity-0 hover:bg-opacity-30 text-red-300 rounded opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
              >
                {actionLoading === friend.id ? "..." : "Remove"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
