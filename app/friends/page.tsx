"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FriendsList from "@/components/Friends/FriendsList";
import DirectMessages from "@/components/Friends/DirectMessages";
import AddFriend from "@/components/Friends/AddFriend";
import { verifyToken } from "@/lib/auth";

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

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Verify token is valid
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const userData = await res.json();
        setUser(userData.user);
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const handleSelectFriend = (friendId: string) => {
    setSelectedFriendId(friendId);
    // In a real app, fetch friend details from the friends list
    // For now, use basic info
    setSelectedFriend({
      id: friendId,
      username: `Friend ${friendId.slice(0, 4)}`,
      status: "online",
    });
  };

  const handleFriendAdded = () => {
    // Trigger refresh of friends list
    // This could be done with a callback to FriendsList
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#36393F]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B65F5]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#36393F]">
      {/* Left Sidebar - Friends List */}
      <div className="w-80 border-r border-[#202225] flex flex-col">
        {/* Header */}
        <div className="h-16 bg-[#2F3136] border-b border-[#202225] flex items-center px-4">
          <h1 className="text-[#DCDDDE] font-bold">Friends</h1>
        </div>

        {/* Add Friend Section */}
        <div className="p-4 border-b border-[#202225]">
          <AddFriend userId={user.userId} onFriendAdded={handleFriendAdded} />
        </div>

        {/* Friends List */}
        <FriendsList
          userId={user.userId}
          onSelectFriend={handleSelectFriend}
          onRefresh={handleFriendAdded}
        />
      </div>

      {/* Right Main Area - Direct Messages */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <DirectMessages
            userId={user.userId}
            friendId={selectedFriend.id}
            friendName={selectedFriend.username}
            friendStatus={selectedFriend.status}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#36393F]">
            <div className="text-center">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-[#DCDDDE] font-bold text-lg mb-2">
                Select a friend to start chatting
              </p>
              <p className="text-[#72767D] text-sm">
                Choose from your friends list on the left
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
