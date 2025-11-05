"use client";

/**
 * Profile Page - User profile management and settings
 * 
 * Features:
 * - Avatar selection from emoji gallery
 * - Status management (online, idle, dnd, invisible)
 * - Bio editing
 * - Friend management
 * - Modern glassmorphism UI with animations
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AddFriend from "@/components/Friends/AddFriend";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Save,
  LogOut,
  MessageCircle,
  Users,
  CheckCircle,
  AlertCircle,
  Smile,
  Activity,
} from "lucide-react";

// Available emoji avatars for user selection
const AVATARS = [
  "🎭",
  "🎨",
  "🎪",
  "🎬",
  "🎮",
  "🎯",
  "🎲",
  "🎳",
  "🎸",
  "🎹",
  "🎺",
  "🎻",
  "🥁",
  "🎤",
  "🎧",
  "📱",
  "💻",
  "⌨️",
  "🖱️",
  "🖥️",
  "📷",
  "📹",
  "🎥",
  "🎞️",
  "📚",
  "📖",
  "✏️",
  "📝",
  "🖊️",
  "🖍️",
  "🎓",
  "🏆",
  "🌟",
  "⭐",
  "✨",
  "💫",
  "🌠",
  "🌌",
  "🌃",
  "🌆",
  "🚀",
  "🛸",
  "🛰️",
  "🌍",
  "🌎",
  "🌏",
  "🗺️",
  "🧭",
];

// Status options with colors and labels
const STATUS_OPTIONS = [
  { value: "online", label: "Online", icon: "🟢", color: "#10b981" },
  { value: "idle", label: "Idle", icon: "🟡", color: "#f59e0b" },
  { value: "dnd", label: "Do Not Disturb", icon: "🔴", color: "#ef4444" },
  { value: "invisible", label: "Invisible", icon: "⚫", color: "#6b7280" },
];

/**
 * Profile Page Component
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateUser, logout } = useAuth();
  
  // Profile state
  const [avatar, setAvatar] = useState("");
  const [status, setStatus] = useState("online");
  const [bio, setBio] = useState("");
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState("profile");

  /**
   * Initialize profile data from user context
   */
  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
      setStatus(user.status || "online");
      setBio(user.bio || "");
    }
  }, [user]);

  /**
   * Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  /**
   * Save profile changes to server
   */
  const handleSave = async () => {
    if (!avatar) {
      setError("Please select an avatar");
      return;
    }
    
    try {
      setSaving(true);
      setError("");
      setSuccess(false);
      
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar, status, bio }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
      
      const data = await res.json();
      updateUser(data.user);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle logout action
   */
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  /**
   * Loading state UI
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center floating-particles bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #a855f7, #f97316)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <motion.p
            className="text-white text-xl font-semibold"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen floating-particles bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              <span className="gradient-text">Profile Settings</span>
            </h1>
            <p className="text-neutral-400 mt-2">
              Customize your WebChat experience
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <motion.button
              onClick={() => router.push("/messenger")}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl glass-button hover:bg-white/10 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Messages</span>
            </motion.button>

            <motion.button
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl glass-button hover:bg-red-500/10 transition-all flex items-center gap-2 text-red-400 hover:text-red-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10" />

            {/* Avatar Display */}
            <motion.div
              className="relative z-10 text-center mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center text-6xl shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #f97316)",
                }}
              >
                {user.avatar || "👤"}
              </div>

              {/* Status Indicator */}
              <motion.div
                className="absolute bottom-2 right-1/2 translate-x-16 w-6 h-6 rounded-full border-4 border-[#1e293b] shadow-lg"
                style={{
                  background:
                    STATUS_OPTIONS.find((s) => s.value === status)?.color ||
                    "#10b981",
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* User Info */}
            <div className="relative z-10 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {user.username}
              </h2>
              <p className="text-neutral-400 text-sm flex items-center gap-2 justify-center mb-4">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>

              {bio && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className="text-neutral-300 text-sm italic">"{bio}"</p>
                </motion.div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold gradient-text">
                    {STATUS_OPTIONS.find((s) => s.value === status)?.icon}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Activity className="w-6 h-6 mx-auto text-purple-400" />
                  <p className="text-xs text-neutral-400 mt-1">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 mt-6"
          >
            <motion.button
              onClick={() => setTab("profile")}
              className={`w-full px-4 py-3 rounded-xl font-semibold mb-3 transition-all flex items-center gap-3 ${
                tab === "profile"
                  ? "text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              style={{
                background:
                  tab === "profile"
                    ? "linear-gradient(135deg, #a855f7, #f97316)"
                    : "transparent",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-5 h-5" />
              <span>Edit Profile</span>
            </motion.button>

            <motion.button
              onClick={() => setTab("friends")}
              className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                tab === "friends"
                  ? "text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
              style={{
                background:
                  tab === "friends"
                    ? "linear-gradient(135deg, #a855f7, #f97316)"
                    : "transparent",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-5 h-5" />
              <span>Add Friends</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <AnimatePresence mode="wait">
            {tab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6 md:p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5" />

                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    <span className="gradient-text">Customize Profile</span>
                  </h2>

                  {/* Success Message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-6 p-4 rounded-xl border backdrop-blur-sm"
                        style={{
                          background: "rgba(16, 185, 129, 0.1)",
                          borderColor: "rgba(16, 185, 129, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <p className="text-green-300 text-sm font-medium">
                            Profile updated successfully!
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-6 p-4 rounded-xl border backdrop-blur-sm"
                        style={{
                          background: "rgba(220, 38, 38, 0.1)",
                          borderColor: "rgba(220, 38, 38, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <p className="text-red-300 text-sm font-medium">
                            {error}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Avatar Selection */}
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-300 mb-4">
                        <Smile className="w-5 h-5 text-purple-400" />
                        Choose Your Avatar
                      </label>
                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-2 p-4 rounded-xl bg-white/5 border border-white/10 max-h-64 overflow-y-auto modern-scrollbar">
                        {AVATARS.map((emoji) => (
                          <motion.button
                            key={emoji}
                            onClick={() => setAvatar(emoji)}
                            className={`p-3 text-2xl rounded-xl transition-all ${
                              avatar === emoji
                                ? "ring-2 ring-purple-400 scale-110"
                                : "hover:bg-white/10"
                            }`}
                            style={{
                              background:
                                avatar === emoji
                                  ? "linear-gradient(135deg, #a855f7, #f97316)"
                                  : "rgba(255, 255, 255, 0.05)",
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>

                      {avatar && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 p-6 rounded-xl text-center"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(249, 115, 22, 0.1))",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <p className="text-neutral-400 text-sm mb-3">
                            Selected Avatar
                          </p>
                          <div className="text-6xl">{avatar}</div>
                        </motion.div>
                      )}
                    </div>

                    {/* Status Selection */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-300 mb-4">
                        <Activity className="w-5 h-5 text-purple-400" />
                        Your Status
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {STATUS_OPTIONS.map((option) => (
                          <motion.button
                            key={option.value}
                            onClick={() => setStatus(option.value)}
                            className={`p-4 rounded-xl border transition-all ${
                              status === option.value
                                ? "border-purple-400"
                                : "border-white/10 hover:border-white/20"
                            }`}
                            style={{
                              background:
                                status === option.value
                                  ? "rgba(168, 85, 247, 0.1)"
                                  : "rgba(255, 255, 255, 0.03)",
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <p
                              className={`text-sm font-medium ${
                                status === option.value
                                  ? "text-white"
                                  : "text-neutral-400"
                              }`}
                            >
                              {option.label}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-3">
                        📝 About You
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={150}
                        placeholder="Tell everyone about yourself..."
                        className="modern-input w-full resize-none focus-ring"
                        rows={4}
                      />
                      <p className="text-neutral-500 text-xs mt-2">
                        {bio.length}/150 characters
                      </p>
                    </div>

                    {/* Save Button */}
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-4 px-6 rounded-xl font-bold text-white text-lg relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #a855f7, #f97316)",
                      }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {saving ? (
                          <>
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Save Profile</span>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-orange-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "friends" && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6 md:p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5" />

                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    <span className="gradient-text">Add Friends</span>
                  </h2>
                  <AddFriend userId={user.id} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
