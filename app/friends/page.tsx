"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";
import FriendsList from "@/components/Friends/FriendsList";
import AddFriend from "@/components/Friends/AddFriend";
import { verifyToken } from "@/lib/auth";

// Lazy-load DirectMessages to avoid SSR issues with Agora SDK
const DirectMessages = dynamicImport(
  () => import("@/components/Friends/DirectMessages"),
  { 
    ssr: false,
    loading: () => <div className="flex-1 flex items-center justify-center">Loading...</div>
  }
);

// Force dynamic rendering - no static generation
export const dynamic = "force-dynamic";

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
        const token = localStorage.getItem("auth_token");
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
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
