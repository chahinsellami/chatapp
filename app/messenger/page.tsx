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

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FriendsList from "@/components/Friends/FriendsList";
import DirectMessages from "@/components/Friends/DirectMessages";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Users, LogOut, Menu, X, UserCircle2 } from "lucide-react";

/**
 * Friend interface - Represents a friend's data
 */
interface Friend {
  id: string;          // Unique identifier
  username: string;    // Display name
  avatar?: string;     // Avatar emoji or URL
  status: string;      // Online/offline status
}

/**
 * Messenger Page Component
 */
export default function MessengerPage() {
  const router = useRouter();
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Desktop Sidebar - Always visible on desktop */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex lg:w-80 glass-card m-3 flex-col relative overflow-hidden"
      >
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5" />

        {/* Header */}
        <motion.div
          className="h-20 border-b border-slate-700/50 backdrop-blur-xl bg-slate-800/40 flex items-center justify-between px-5 relative z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg tracking-tight">
                WebChat
              </h1>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div>
                {user.username}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Profile Button */}
            <motion.button
              onClick={() => router.push("/profile")}
              className="p-2 rounded-lg glass-button hover:bg-slate-700/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Profile"
            >
              {user.avatar?.startsWith("/avatars/") ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-5 h-5 rounded-lg object-cover"
                />
              ) : (
                <span className="text-base">{user.avatar || "👤"}</span>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Friends List */}
        <motion.div
          className="flex-1 overflow-hidden relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <FriendsList
            userId={user.id}
            onSelectFriend={handleSelectFriend}
          />
        </motion.div>

        {/* Footer with logout */}
        <motion.div
          className="p-4 border-t border-slate-700/50 backdrop-blur-xl bg-slate-800/40 relative z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl glass-button hover:bg-red-500/10 transition-all text-red-400 hover:text-red-300 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-80 glass-card m-3 flex flex-col overflow-hidden z-50 lg:hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10" />

              {/* Header */}
              <div className="h-20 border-b border-white/10 backdrop-blur-xl bg-white/5 flex items-center justify-between px-6 relative z-10">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #f97316)",
                    }}
                  >
                    <MessageCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-white font-bold text-xl gradient-text">
                      WebChat
                    </h1>
                    <p className="text-xs text-neutral-400">{user.username}</p>
                  </div>
                </div>

                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg glass-button hover:bg-white/10"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </motion.button>
              </div>

              {/* Friends List */}
              <div className="flex-1 overflow-hidden relative z-10">
                <FriendsList
                  userId={user.id}
                  onSelectFriend={handleSelectFriend}
                />
              </div>

              {/* Logout Button */}
              <div className="p-4 border-t border-white/10 backdrop-blur-xl bg-white/5 relative z-10">
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg glass-button hover:bg-red-500/10 text-red-400"
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
              className="lg:hidden h-16 glass-card m-3 mb-0 flex items-center gap-4 px-4 relative overflow-hidden"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-orange-500/5" />

              <motion.button
                onClick={() => {
                  setSelectedFriend(null);
                  setSelectedFriendId(null);
                }}
                className="p-2 rounded-lg glass-button hover:bg-white/10 relative z-10"
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>

              <div className="flex items-center gap-3 relative z-10">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #f97316)",
                  }}
                >
                  {selectedFriend.avatar?.startsWith("/avatars/") ? (
                    <img
                      src={selectedFriend.avatar}
                      alt={selectedFriend.username}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-lg">
                      {selectedFriend.avatar ||
                        selectedFriend.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-white font-semibold">
                    {selectedFriend.username}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {selectedFriend.status}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Messages Component */}
            <div className="flex-1 m-3 mt-3 lg:mt-3 overflow-hidden">
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
            className="h-full glass-card m-3 flex flex-col items-center justify-center relative overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5" />

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden absolute top-5 left-5 p-3 rounded-xl glass-button hover:bg-slate-700/50 z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-6 h-6 text-slate-200" />
            </motion.button>

            <motion.div
              className="text-center relative z-10 max-w-lg mx-auto p-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="w-28 h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600"
                animate={{
                  rotate: [0, 3, -3, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MessageCircle className="w-14 h-14 text-white" />
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
                className="text-slate-400 text-base md:text-lg mb-10 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                Select a friend from the sidebar to start messaging, or find new friends to connect with.
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all"
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
                  className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all"
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
