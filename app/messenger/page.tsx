"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamicImport from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import FriendsList from "@/components/Friends/FriendsList";
import { MessageCircle, LogOut, Menu, X, UserCircle2 } from "lucide-react";

// Lazy-load DirectMessages to avoid SSR issues with Agora SDK
const DirectMessages = dynamicImport(
  () => import("@/components/Friends/DirectMessages"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">Loading...</div>
    ),
  }
);

// Force dynamic rendering
export const dynamic = "force-dynamic";

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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

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
        .catch((err) => console.error("Error fetching friend:", err));
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
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 bg-neutral-950 border-r border-neutral-800 flex-col">
        {/* Header */}
        <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-semibold text-sm">WebChat</h1>
              <p className="text-xs text-neutral-500 truncate">
                {user.username}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/profile")}
            className="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
            title="Profile"
          >
            <UserCircle2 className="w-4.5 h-4.5 text-neutral-400" />
          </button>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-hidden">
          <FriendsList userId={user.id} onSelectFriend={handleSelectFriend} />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
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
                onSelectFriend={handleSelectFriend}
              />
            </div>

            <div className="p-3 border-t border-neutral-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
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

export default function MessengerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-blue-600">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-neutral-400 text-base font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <MessengerContent />
    </Suspense>
  );
}
