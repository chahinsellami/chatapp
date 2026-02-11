"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
const FriendsList = dynamic(() => import("@/components/Friends/FriendsList"), {
  ssr: false,
});
import { MessageCircle, Menu, X, Search } from "lucide-react";

// Lazy-load DirectMessages to avoid SSR issues with Agora SDK
const DirectMessages = dynamic(
  () => import("@/components/Friends/DirectMessages"),
  {
    ssr: false,
    loading: () => null,
  },
);

// Force dynamic rendering

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: string;
}

function MessengerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, logout } = useAuth();

  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [conversations, setConversations] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    try {
      setLoadingConversations(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      } else {
        console.error("Failed to fetch conversations:", res.status);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch friends list (for messaging fallback if no conversations yet)
  const fetchFriends = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchFriends();
      // Only refresh on mount, don't poll constantly
    }
  }, [user]);

  useEffect(() => {
    const friendId = searchParams.get("friend");
    if (friendId && user) {
      const token = localStorage.getItem("auth_token");
      fetch(`/api/users/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((data) => {
          if (data.user) {
            handleSelectFriend(data.user.id, {
              id: data.user.id,
              username: data.user.username,
              avatar: data.user.avatar,
              status: data.user.status || "online",
            });
          }
        })
        .catch(() => {
          /* Error fetching friend */
        });
    }
  }, [searchParams, user]);

  const handleSelectFriend = (friendId: string, friendData?: Friend) => {
    setSelectedFriendId(friendId);
    if (friendData) {
      setSelectedFriend(friendData);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-blue-600">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <p className="text-neutral-400 text-base font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Desktop Sidebar - Facebook Messenger Style */}
      <div className="hidden lg:flex lg:w-96 bg-neutral-950 border-r border-neutral-800 flex-col">
        {/* Header with Title */}
        <div className="p-4 border-b border-neutral-800 relative">
          <h1 className="text-2xl font-bold text-white">Chats</h1>

          {/* Profile Button - Top Right */}
          <button
            onClick={() => router.push("/profile")}
            className="absolute top-4 right-4 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-600 hover:ring-2 hover:ring-blue-400 transition-all hover:scale-110"
            title="Profile"
          >
            {user.avatar &&
            (user.avatar.startsWith("http") || user.avatar.startsWith("/")) ? (
              <Image
                src={user.avatar}
                alt={user.username}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {user.username[0]?.toUpperCase()}
              </span>
            )}
          </button>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Messenger"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Friends/Chat List */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : conversations.length === 0 && friends.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <MessageCircle className="w-12 h-12 text-neutral-600 mb-3" />
              <p className="text-neutral-400 text-sm text-center">
                No conversations yet
              </p>
              <p className="text-neutral-500 text-xs text-center mt-1">
                Go to Friends to connect with people
              </p>
            </div>
          ) : (
            <FriendsList
              userId={user.id}
              friends={
                searchQuery
                  ? [...conversations, ...friends]
                      .filter((c) =>
                        c.username
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      )
                      .filter(
                        (value, index, array) =>
                          array.findIndex((v) => v.id === value.id) === index,
                      )
                  : conversations.length > 0
                    ? conversations
                    : friends
              }
              onSelectFriend={handleSelectFriend}
            />
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          />

          <div className="fixed left-0 top-0 bottom-0 w-80 bg-neutral-950 border-r border-neutral-800 flex flex-col z-50 lg:hidden">
            <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-semibold text-sm">WebChat</h1>
                  <p className="text-xs text-neutral-500">{user.username}</p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <FriendsList
                userId={user.id}
                friends={conversations.length > 0 ? conversations : friends}
                onSelectFriend={handleSelectFriend}
              />
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-neutral-950">
        {selectedFriend ? (
          <div className="flex-1 overflow-hidden">
            <DirectMessages
              userId={user.id}
              friendId={selectedFriend.id}
              friendName={selectedFriend.username}
              friendAvatar={selectedFriend.avatar}
              friendStatus={selectedFriend.status}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center relative">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden absolute top-4 left-4 p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800"
            >
              <Menu className="w-5 h-5 text-neutral-300" />
            </button>

            <div className="text-center max-w-md px-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center bg-blue-600/10 border border-blue-600/20">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-semibold mb-2 text-white">
                No conversation selected
              </h2>

              <p className="text-neutral-500 text-sm">
                Choose a friend from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function MessengerPage() {
  return (
    <Suspense>
      <MessengerContent />
    </Suspense>
  );
}
