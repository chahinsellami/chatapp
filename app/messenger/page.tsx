"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FriendsList from "@/components/Friends/FriendsList";
import DirectMessages from "@/components/Friends/DirectMessages";

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: string;
}

interface PendingRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  avatar?: string;
}

export default function MessengerPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    fetchPendingRequests();
  }, [user]);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleSelectFriend = (friendId: string, friendData?: Friend) => {
    setSelectedFriendId(friendId);
    if (friendData) {
      setSelectedFriend(friendData);
    }
    setShowRequests(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setAcceptingId(requestId);
      const token = localStorage.getItem("auth_token");

      const res = await fetch(
        `/api/friends/requests/${requestId}?action=accept`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        fetchPendingRequests();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(
        `/api/friends/requests/${requestId}?action=reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#36393F]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B65F5]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#36393F] flex-col md:flex-row">
      {/* Left Sidebar - Hidden on mobile unless selected friend is null */}
      <div
        className={`${
          selectedFriend ? "hidden md:flex" : "flex"
        } w-full md:w-72 bg-[#2F3136] flex-col border-r border-[#202225]`}
      >
        {/* Header */}
        <div className="h-16 bg-[#36393F] border-b border-[#202225] flex items-center justify-between px-3 md:px-4">
          <div className="min-w-0">
            <h1 className="text-white font-bold text-lg">WebChat</h1>
            <p className="text-xs text-[#72767D] truncate">{user.username}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="p-2 hover:bg-[#40444B] rounded-full transition relative"
                title="Friend requests"
              >
                <span className="text-xl">🔔</span>
                {pendingRequests.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => router.push("/profile")}
              className="p-2 hover:bg-[#40444B] rounded-full transition"
              title="Profile"
            >
              <span className="text-xl">{user.avatar || "👤"}</span>
            </button>
          </div>
        </div>

        {/* Friend Requests Panel */}
        {showRequests && pendingRequests.length > 0 && (
          <div className="border-b border-[#202225] bg-[#36393F] p-4 max-h-64 overflow-y-auto">
            <h3 className="text-sm font-bold text-[#DCDDDE] mb-3">
              📬 Friend Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-2 bg-[#2F3136] rounded-lg hover:bg-[#35373B] transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center text-white text-xs font-bold">
                      {request.senderUsername[0].toUpperCase()}
                    </div>
                    <span className="text-xs text-[#DCDDDE] flex-1 truncate">
                      {request.senderUsername}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={acceptingId === request.id}
                      className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition font-medium"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition font-medium"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="flex-1 overflow-hidden">
          <FriendsList
            userId={user.id}
            onSelectFriend={(friendId, friendData) => {
              handleSelectFriend(friendId, friendData);
              setShowRequests(false);
            }}
            onRefresh={fetchPendingRequests}
          />
        </div>
      </div>

      {/* Right Main Area - Messages */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <DirectMessages
            userId={user.id}
            friendId={selectedFriend.id}
            friendName={selectedFriend.username}
            friendStatus={selectedFriend.status}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#36393F]">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-[#DCDDDE] font-bold text-2xl mb-2">
                WebChat Messenger
              </p>
              <p className="text-[#72767D] text-base mb-6">
                Select a friend to start messaging
              </p>
              <button
                onClick={() => router.push("/profile")}
                className="px-6 py-2 bg-[#5B65F5] hover:bg-opacity-80 text-white rounded-lg font-semibold transition"
              >
                👤 Go to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
