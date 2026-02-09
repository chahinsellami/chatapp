"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const FriendsList = dynamic(() => import("@/components/Friends/FriendsList"), {
  ssr: false,
});
const AddFriend = dynamic(() => import("@/components/Friends/AddFriend"), {
  ssr: false,
});
const DirectMessages = dynamic(
  () => import("@/components/Friends/DirectMessages"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">Loading...</div>
    ),
  }
);
import { useSocket } from "@/lib/useSocket";

interface User {
  userId: string;
  username: string;
  email: string;
}

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: string;
}

interface PendingRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [expandPending, setExpandPending] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Socket for online status
  const { onlineUsers } = useSocket(user?.userId || null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }
        const userData = await res.json();
        setUser(userData.user);
      } catch (error) {
        localStorage.removeItem("auth_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const fetchFriendsData = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [user]);

  // Fetch friends on mount
  useEffect(() => {
    if (user) {
      fetchFriendsData();
    }
  }, [user, fetchFriendsData]);

  const handleSelectFriend = (friendId: string, friendData?: any) => {
    setSelectedFriendId(friendId);
    if (friendData) {
      setSelectedFriend({
        id: friendData.id || friendId,
        username: friendData.username || `Friend`,
        avatar: friendData.avatar,
        status: friendData.status || "offline",
      });
    } else {
      const friend = friends.find((f) => f.id === friendId);
      if (friend) {
        setSelectedFriend(friend);
      }
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/friends/requests/${requestId}?action=accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchFriendsData();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/friends/requests/${requestId}?action=reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchFriendsData();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("Remove this friend?")) return;
    try {
      setActionLoading(friendId);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchFriendsData();
        if (selectedFriendId === friendId) {
          setSelectedFriendId(null);
          setSelectedFriend(null);
        }
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFriendAdded = () => {
    fetchFriendsData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Map pending requests for FriendsList component format
  const formattedRequests = pendingRequests.map((r) => ({
    id: r.id,
    username: r.sender?.username || "Unknown",
    avatar: r.sender?.avatar || null,
    createdAt: r.created_at,
  }));

  // Add online status to friends
  const friendsWithStatus = friends.map((f) => ({
    ...f,
    status: onlineUsers.has(f.id) ? "online" : "offline",
  }));

  return (
    <div className="flex h-screen bg-black">
      {/* Left Sidebar - Friends List */}
      <div className="w-80 border-r border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-neutral-950 border-b border-neutral-800 flex items-center px-4">
          <h1 className="text-white font-bold">Friends</h1>
        </div>
        {/* Add Friend Section */}
        <div className="p-4 border-b border-neutral-800">
          <AddFriend userId={user.userId} onFriendAdded={handleFriendAdded} />
        </div>
        {/* Friends List */}
        <FriendsList
          userId={user.userId}
          friends={friendsWithStatus}
          onlineUsers={onlineUsers}
          pendingRequests={formattedRequests}
          expandPending={expandPending}
          setExpandPending={setExpandPending}
          handleAcceptRequest={handleAcceptRequest}
          handleRejectRequest={handleRejectRequest}
          handleRemoveFriend={handleRemoveFriend}
          actionLoading={actionLoading}
          onSelectFriend={handleSelectFriend}
        />
      </div>
      {/* Right Main Area - Direct Messages */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <DirectMessages
            userId={user.userId}
            friendId={selectedFriend.id}
            friendName={selectedFriend.username}
            friendAvatar={selectedFriend.avatar}
            friendStatus={selectedFriend.status}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-white font-bold text-lg mb-2">
                Select a friend to start chatting
              </p>
              <p className="text-neutral-400 text-sm">
                Choose from your friends list on the left
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
