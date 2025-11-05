"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FriendsList from "@/components/Friends/FriendsList";
import DirectMessages from "@/components/Friends/DirectMessages";
import { motion } from "framer-motion";
import { MessageCircle, Users, Settings, LogOut } from "lucide-react";

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
  const { user, isLoading, logout } = useAuth();
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen floating-particles">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #a855f7, #f97316)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.div>
          <motion.p
            className="text-neutral-300 text-lg font-medium"
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
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Enhanced with modern design */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{
          x: selectedFriend && !sidebarOpen ? -300 : 0,
          opacity: selectedFriend && !sidebarOpen ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-full md:w-80 glass-card m-2 flex flex-col relative overflow-hidden ${
          selectedFriend ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5" />

        {/* Header with enhanced styling */}
        <motion.div
          className="h-20 border-b border-white/10 backdrop-blur-sm bg-white/5 flex items-center justify-between px-6 relative z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #a855f7, #f97316)",
              }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-xl tracking-tight">
                <span className="gradient-text">WebChat</span>
              </h1>
              <p className="text-xs text-neutral-400 truncate flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {user.username}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Profile Button */}
            <motion.button
              onClick={() => router.push("/profile")}
              className="p-2 rounded-lg glass-button hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Profile"
            >
              {user.avatar?.startsWith("/avatars/") ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-6 h-6 rounded-lg object-cover"
                />
              ) : (
                <span className="text-lg">{user.avatar || "👤"}</span>
              )}
            </motion.button>

            {/* Mobile menu toggle */}
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg glass-button hover:bg-white/10 transition-colors md:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-5 h-5 text-neutral-400" />
            </motion.button>
          </div>
        </motion.div>

        {/* Friends List with modern scrollbar */}
        <motion.div
          className="flex-1 overflow-hidden relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="h-full modern-scrollbar">
            <FriendsList
              userId={user.id}
              onSelectFriend={(friendId, friendData) => {
                handleSelectFriend(friendId, friendData);
                setSidebarOpen(false); // Close sidebar on mobile after selection
              }}
            />
          </div>
        </motion.div>

        {/* Footer with logout */}
        <motion.div
          className="p-4 border-t border-white/10 backdrop-blur-sm bg-white/5 relative z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg glass-button hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Right Main Area - Messages */}
      <motion.div
        className="flex-1 m-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {selectedFriend ? (
          <DirectMessages
            userId={user.id}
            friendId={selectedFriend.id}
            friendName={selectedFriend.username}
            friendAvatar={selectedFriend.avatar}
            friendStatus={selectedFriend.status}
          />
        ) : (
          <motion.div
            className="h-full glass-card flex flex-col items-center justify-center relative overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5" />

            <motion.div
              className="text-center relative z-10 max-w-md mx-auto p-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #f97316)",
                }}
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MessageCircle className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h2
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <span className="gradient-text">Welcome to WebChat</span>
              </motion.h2>

              <motion.p
                className="text-neutral-400 text-lg mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                Select a friend from the sidebar to start a conversation, or add
                new friends to expand your network.
              </motion.p>

              <motion.button
                onClick={() => router.push("/friends")}
                className="px-8 py-4 rounded-xl font-bold text-white text-lg relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #f97316)",
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  <span>Find Friends</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-orange-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
