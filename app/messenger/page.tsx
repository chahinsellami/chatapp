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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const handleSelectFriend = (friendId: string, friendData?: Friend) => {
    setSelectedFriendId(friendId);
    if (friendData) {
      setSelectedFriend(friendData);
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

        {/* Friends List */}
        <div className="flex-1 overflow-hidden">
          <FriendsList
            userId={user.id}
            onSelectFriend={(friendId, friendData) => {
              handleSelectFriend(friendId, friendData);
            }}
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
