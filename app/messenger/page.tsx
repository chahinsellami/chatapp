"use client";

/**
 * Messenger Page - Main messaging interface
 *
 * This is the primary messaging page where users can:
 * - View their friends list in the sidebar
 * - Select friends to start conversations
 * - Send and receive messages in real-time
 * - Access profile and settings
 * - Logout from the application
 *
 * Features:
 * - Responsive design with mobile-friendly sidebar
 * - Smooth animations and transitions
 * - Real-time messaging with Socket.IO
 * - Elegant glassmorphism UI
 * - Fixed sidebar visibility on desktop
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FriendsList from "@/components/Friends/FriendsList";
import DirectMessages from "@/components/Friends/DirectMessages";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Users,
  LogOut,
  Menu,
  X,
  UserCircle2,
} from "lucide-react";

/**
 * Friend interface - Represents a friend's data
 */
interface Friend {
  id: string; // Unique identifier
  username: string; // Display name
  avatar?: string; // Avatar emoji or URL
  status: string; // Online/offline status
}

/**
 * Messenger Page Component
 */
function MessengerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, logout } = useAuth();

  // Selected friend state for displaying chat
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  // Mobile sidebar visibility control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Handle friend parameter from URL
  useEffect(() => {
    const friendId = searchParams.get("friend");
    if (friendId && user) {
      // Fetch friend data and select them
      const token = localStorage.getItem("auth_token");
      fetch(`/api/users/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user");
          }
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
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-blue-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.div>
          <motion.p
            className="text-neutral-400 text-lg font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading WebChat...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Desktop Sidebar - Always visible on desktop */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex lg:w-80 bg-neutral-950 border-r border-neutral-800 flex-col relative overflow-hidden"
      >
        {/* Header */}
        <motion.div
          className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex items-center justify-between px-5"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base tracking-tight">
                WebChat
              </h1>
              <p className="text-xs text-neutral-500 truncate">
                {user.username}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Profile Button */}
            <motion.button
              onClick={() => router.push("/profile")}
              className="p-2 rounded-lg hover:bg-neutral-800/70 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Profile"
            >
              <UserCircle2 className="w-5 h-5 text-neutral-400" />
            </motion.button>
          </div>
        </motion.div>

        {/* Friends List */}
        <motion.div
          className="flex-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <FriendsList userId={user.id} onSelectFriend={handleSelectFriend} />
        </motion.div>

        {/* Footer with logout */}
        <motion.div
          className="p-4 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/70 transition-all text-neutral-400 hover:text-red-400 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-neutral-950 border-r border-neutral-800 flex flex-col overflow-hidden z-50 lg:hidden"
            >
              {/* Header */}
              <div className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex items-center justify-between px-5">
                <div className="flex items-center gap-3">
                  <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-white font-bold text-base">WebChat</h1>
                    <p className="text-xs text-neutral-500">{user.username}</p>
                  </div>
                </div>

                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-800/70"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </motion.button>
              </div>

              {/* Friends List */}
              <div className="flex-1 overflow-hidden">
                <FriendsList
                  userId={user.id}
                  onSelectFriend={handleSelectFriend}
                />
              </div>

              {/* Logout Button */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/70 text-neutral-400 hover:text-red-400"
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {selectedFriend ? (
          <>
            {/* Mobile Header with back button */}
            <motion.div
              className="lg:hidden h-16 bg-neutral-950 border-b border-neutral-800 flex items-center gap-4 px-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.button
                onClick={() => {
                  setSelectedFriend(null);
                  setSelectedFriendId(null);
                }}
                className="p-2 rounded-lg hover:bg-neutral-800/70"
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-neutral-400" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600">
                  {selectedFriend.avatar?.startsWith("/avatars/") ? (
                    <img
                      src={selectedFriend.avatar}
                      alt={selectedFriend.username}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-lg text-white">
                      {selectedFriend.avatar ||
                        selectedFriend.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm">
                    {selectedFriend.username}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {selectedFriend.status}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Messages Component */}
            <div className="flex-1 overflow-hidden bg-neutral-950">
              <DirectMessages
                userId={user.id}
                friendId={selectedFriend.id}
                friendName={selectedFriend.username}
                friendAvatar={selectedFriend.avatar}
                friendStatus={selectedFriend.status}
              />
            </div>
          </>
        ) : (
          <motion.div
            className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-neutral-950"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden absolute top-5 left-5 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-6 h-6 text-neutral-300" />
            </motion.button>

            <motion.div
              className="text-center max-w-lg mx-auto p-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-8 rounded-2xl flex items-center justify-center bg-blue-600"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MessageCircle className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Welcome to WebChat
              </motion.h2>

              <motion.p
                className="text-neutral-400 text-base md:text-lg mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                Select a friend from the sidebar to start messaging,
                <br />
                or find new friends to connect with.
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden px-6 py-3 rounded-lg font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  <span className="flex items-center gap-2">
                    <Menu className="w-5 h-5" />
                    <span>Open Menu</span>
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => router.push("/friends")}
                  className="px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>Find Friends</span>
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function MessengerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-black">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-blue-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </motion.div>
            <motion.p
              className="text-neutral-400 text-lg font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading WebChat...
            </motion.p>
          </motion.div>
        </div>
      }
    >
      <MessengerContent />
    </Suspense>
  );
}
