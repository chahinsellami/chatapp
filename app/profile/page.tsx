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
  Upload,
  X,
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
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      // Check if avatar is a custom image URL
      if (
        user.avatar.startsWith("/avatars/") ||
        user.avatar.startsWith("http")
      ) {
        setCustomImage(user.avatar);
      }
      // Check if user has cover image
      if (user.coverImage) {
        setCoverImage(user.coverImage);
      }
    }
  }, [user]);

  /**
   * Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  /**
   * Handle image file selection
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setAvatar(reader.result as string); // Set as avatar
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle cover image file selection
   */
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setCoverFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Remove custom image and go back to emoji selection
   */
  const handleRemoveImage = () => {
    setCustomImage(null);
    setImageFile(null);
    setAvatar("");
  };

  /**
   * Remove cover image
   */
  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverFile(null);
  };

  /**
   * Save profile changes to server
   */
  const handleSave = async () => {
    if (!avatar && !customImage) {
      setError("Please select an avatar or upload an image");
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
        body: JSON.stringify({
          avatar: customImage || avatar,
          coverImage: coverImage || "",
          status,
          bio,
        }),
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
      <div className="min-h-screen flex items-center justify-center floating-particles bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Facebook-style Profile Header */}
      <div className="max-w-6xl mx-auto">
        {/* Cover Photo Section */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-[400px] bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-b-2xl overflow-hidden"
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No cover photo</p>
                </div>
              </div>
            )}

            {/* Edit Cover Photo Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-lg font-semibold flex items-center gap-2 shadow-lg backdrop-blur-sm"
              onClick={() => document.getElementById("cover-upload")?.click()}
            >
              <Upload className="w-4 h-4" />
              Edit cover photo
            </motion.button>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
              id="cover-upload"
            />
          </motion.div>

          {/* Profile Picture and Info Section */}
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative">
              {/* Profile Picture */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-32 left-0"
              >
                <div className="relative">
                  <div className="w-44 h-44 rounded-full border-4 border-slate-900 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden shadow-2xl">
                    {customImage ? (
                      <img
                        src={customImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : avatar && !avatar.startsWith("http") ? (
                      <div className="w-full h-full flex items-center justify-center text-7xl">
                        {avatar}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-20 h-20 text-white" />
                      </div>
                    )}
                  </div>
                  {/* Edit Profile Picture Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                    className="absolute bottom-2 right-2 w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg"
                  >
                    <Upload className="w-5 h-5 text-white" />
                  </motion.button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                </div>
              </motion.div>

              {/* Name and Info */}
              <div className="pt-16 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-700">
                <div className="ml-0 md:ml-52">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {user.username}
                  </h1>
                  <p className="text-slate-400 mb-2">{user.email}</p>
                  {bio && <p className="text-slate-300 italic mb-2">"{bio}"</p>}
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-2xl">
                      {STATUS_OPTIONS.find((s) => s.value === status)?.icon}
                    </span>
                    <span className="text-sm font-medium">
                      {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 md:mt-0">
                  <motion.button
                    onClick={() => router.push("/messenger")}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Messages
                  </motion.button>

                  <motion.button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </motion.button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-4 mt-4">
                <motion.button
                  onClick={() => setTab("profile")}
                  className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                    tab === "profile"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Profile
                </motion.button>

                <motion.button
                  onClick={() => setTab("friends")}
                  className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                    tab === "friends"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Friends
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {tab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 rounded-2xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Customize Your Profile
                </h2>

                {/* Success/Error Messages */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-green-300 font-medium">
                        Profile updated successfully!
                      </p>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-red-300 font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-8">
                  {/* Current Images Preview */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">
                        Profile Picture
                      </label>
                      <div className="relative h-48 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
                        {customImage ? (
                          <>
                            <img
                              src={customImage}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                            <motion.button
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="w-4 h-4 text-white" />
                            </motion.button>
                          </>
                        ) : avatar && !avatar.startsWith("http") ? (
                          <div className="text-6xl">{avatar}</div>
                        ) : (
                          <User className="w-16 h-16 text-slate-600" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">
                        Cover Photo
                      </label>
                      <div className="relative h-48 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
                        {coverImage ? (
                          <>
                            <img
                              src={coverImage}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                            <motion.button
                              onClick={handleRemoveCoverImage}
                              className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="w-4 h-4 text-white" />
                            </motion.button>
                          </>
                        ) : (
                          <div className="text-center text-slate-600">
                            <Upload className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">No cover photo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emoji Avatar Selection */}
                  {!customImage && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4">
                        <Smile className="w-5 h-5 text-indigo-400" />
                        Or Choose an Emoji Avatar
                      </label>
                      <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700 max-h-64 overflow-y-auto">
                        {AVATARS.map((emoji) => (
                          <motion.button
                            key={emoji}
                            onClick={() => {
                              setAvatar(emoji);
                              setCustomImage(null);
                            }}
                            className={`p-3 text-2xl rounded-xl transition-all ${
                              avatar === emoji
                                ? "ring-2 ring-blue-500 bg-blue-500/20"
                                : "hover:bg-slate-700"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-4">
                      Your Status
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {STATUS_OPTIONS.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setStatus(option.value)}
                          className={`p-4 rounded-xl border transition-all ${
                            status === option.value
                              ? "border-blue-500 bg-blue-500/20"
                              : "border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <p
                            className={`text-sm font-medium ${
                              status === option.value
                                ? "text-white"
                                : "text-slate-400"
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
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      About You
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={150}
                      placeholder="Tell everyone about yourself..."
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                    <p className="text-slate-500 text-xs mt-2">
                      {bio.length}/150 characters
                    </p>
                  </div>

                  {/* Save Button */}
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Profile
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {tab === "friends" && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 rounded-2xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Add Friends
                </h2>
                <AddFriend userId={user.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
