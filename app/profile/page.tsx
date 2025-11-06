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
import NavigationBar from "@/components/Layout/NavigationBar";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import TabNavigation, { Tab } from "@/components/Common/TabNavigation";
import AlertMessage from "@/components/Common/AlertMessage";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Save,
  Users,
  Smile,
  Upload,
  X,
  MessageCircle,
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
  const [tab, setTab] = useState("posts");

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
    return <LoadingSpinner icon={User} message="Loading Profile..." />;
  }

  if (!user) return null;

  const tabs: Tab[] = [
    { id: "posts", label: "Posts" },
    { id: "friends", label: "Friends", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation Bar */}
      <NavigationBar currentPage="profile" />

      {/* Facebook-style Profile Header */}
      <ProfileHeader
        coverImage={coverImage}
        customImage={customImage}
        avatar={avatar}
        username={user.username}
        bio={bio}
        status={status}
        statusColor={
          STATUS_OPTIONS.find((s) => s.value === status)?.color || "#10b981"
        }
        onCoverImageChange={handleCoverImageChange}
      />

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-6">
        {/* Navigation Tabs */}
        <TabNavigation
          tabs={tabs}
          activeTab={tab}
          onTabChange={(tabId) => setTab(tabId)}
        />

        {/* Content Area */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {tab === "posts" && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Create Post Card */}
                <div className="glass-card p-6 rounded-2xl">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Create a Post
                  </h2>
                  <div className="space-y-4">
                    <textarea
                      placeholder="What's on your mind?"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Photo
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                      >
                        Post
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Posts Feed - Placeholder */}
                <div className="glass-card p-8 rounded-2xl text-center">
                  <div className="text-slate-400">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-slate-400">
                      Share your first post with your friends!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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
                    <AlertMessage
                      type="success"
                      message="Profile updated successfully!"
                    />
                  )}
                  {error && <AlertMessage type="error" message={error} />}
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
