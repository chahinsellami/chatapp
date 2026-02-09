"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/Common";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  LogOut,
  Bell,
  Lock,
  Palette,
  User as UserIcon,
  Camera,
  Check,
  AlertCircle,
  Mail,
  Clock,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, updateUser, logout } = useAuth();
  const { isConnected, userStatuses } = useSocketContext();

  // Profile state
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  // Status is now auto-detected — derive it from the presence system
  const autoStatus = user?.id
    ? userStatuses.get(user.id) || (isConnected ? "online" : "offline")
    : "offline";
  const [bio, setBio] = useState("");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "account"
  >("profile");

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
  ];

  // Auto-detected status display config
  const STATUS_DISPLAY: Record<string, { label: string; color: string; description: string }> = {
    online: { label: "Online", color: "bg-green-500", description: "You're active and connected" },
    offline: { label: "Offline", color: "bg-gray-500", description: "You appear offline to others" },
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatar(user.avatar || "");
      setBio(user.bio || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCustomImage(null);
    setImageFile(null);
    setAvatar("");
  };

  const handleSave = async () => {
    if (!avatar && !customImage) {
      setError("Please select an avatar");
      return;
    }
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters");
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

      let profileImageUrl = customImage || avatar;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload/profile-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error || "Failed to upload image");
        }

        const uploadData = await uploadRes.json();
        profileImageUrl = uploadData.imageUrl;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          avatar: profileImageUrl,
          status: autoStatus,
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

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return <LoadingSpinner icon={UserIcon} message="Loading Settings..." />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              {[
                { id: "profile", label: "Profile", icon: UserIcon },
                { id: "preferences", label: "Preferences", icon: Palette },
                { id: "account", label: "Account", icon: Lock },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white"
                      : "text-neutral-400 hover:bg-neutral-800"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Success/Error Messages */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400"
                    >
                      <Check className="w-5 h-5" />
                      <span>Profile updated successfully!</span>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Profile Card */}
                  <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                    <h2 className="text-xl font-bold text-white mb-6">
                      Profile Information
                    </h2>

                    {/* Avatar Section */}
                    <div className="mb-8">
                      <label className="block text-neutral-300 font-semibold mb-4">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl overflow-hidden border-2 border-neutral-700">
                          {customImage ? (
                            <Image
                              src={customImage}
                              alt="Avatar"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : avatar && !avatar.startsWith("http") ? (
                            avatar
                          ) : avatar && avatar.startsWith("http") ? (
                            <Image
                              src={avatar}
                              alt="Avatar"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.username[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer flex items-center gap-2 w-fit transition-colors">
                              <Camera className="w-4 h-4" />
                              Upload Photo
                            </span>
                          </label>
                          {customImage && (
                            <button
                              onClick={handleRemoveImage}
                              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Emoji Avatars */}
                    {!customImage && (
                      <div className="mb-8">
                        <label className="block text-neutral-300 font-semibold mb-4">
                          Or Choose an Emoji Avatar
                        </label>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                          {AVATARS.map((emoji) => (
                            <motion.button
                              key={emoji}
                              onClick={() => {
                                setAvatar(emoji);
                                setCustomImage(null);
                              }}
                              className={`text-3xl p-3 rounded-lg transition-all ${
                                avatar === emoji
                                  ? "bg-blue-600 scale-110"
                                  : "bg-neutral-800 hover:bg-neutral-700"
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

                    {/* Username */}
                    <div className="mb-8">
                      <label className="block text-neutral-300 font-semibold mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        minLength={3}
                        maxLength={32}
                      />
                      <p className="text-neutral-500 text-sm mt-1">
                        3-32 characters, no spaces
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="mb-8">
                      <label className="block text-neutral-300 font-semibold mb-2">
                        About You
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={150}
                        className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
                        rows={4}
                        placeholder="Tell everyone about yourself..."
                      />
                      <p className="text-neutral-500 text-sm mt-1">
                        {bio.length}/150 characters
                      </p>
                    </div>

                    {/* Auto-detected Status */}
                    <div className="mb-8">
                      <label className="block text-neutral-300 font-semibold mb-3">
                        Status
                      </label>
                      <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${STATUS_DISPLAY[autoStatus]?.color || "bg-gray-500"} ${autoStatus === "online" ? "animate-pulse" : ""}`} />
                          <div>
                            <p className="text-white font-semibold">
                              {STATUS_DISPLAY[autoStatus]?.label || "Unknown"}
                            </p>
                            <p className="text-neutral-400 text-sm">
                              {STATUS_DISPLAY[autoStatus]?.description || ""}
                            </p>
                          </div>
                        </div>
                        <p className="text-neutral-500 text-xs mt-3">
                          Your status is automatically detected based on your activity.
                        </p>
                      </div>
                    </div>

                    {/* Save Button */}
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 space-y-6">
                  <h2 className="text-xl font-bold text-white">Preferences</h2>

                  <div className="space-y-4">
                    {[
                      { icon: Bell, label: "Message Notifications" },
                      { icon: Bell, label: "Call Notifications" },
                      { icon: Bell, label: "Friend Request Notifications" },
                      { icon: Palette, label: "Theme Customization" },
                      { icon: Palette, label: "Dark Mode" },
                      { icon: Palette, label: "Color Scheme" },
                      { icon: Clock, label: "Online Status" },
                      { icon: Clock, label: "Status Visibility" },
                      { icon: Lock, label: "Privacy Settings" },
                      { icon: Lock, label: "Who Can Message You" },
                      { icon: Lock, label: "Who Can Call You" },
                      { icon: Lock, label: "Who Can See Your Profile" },
                      { icon: Bell, label: "Email Notifications" },
                      { icon: Palette, label: "Font Size" },
                      { icon: Clock, label: "Time Zone" },
                      { icon: Lock, label: "Two Factor Authentication" },
                      { icon: Bell, label: "Activity Status" },
                      { icon: Palette, label: "Interface Language" },
                      { icon: Clock, label: "Auto Lock Timeout" },
                      { icon: Lock, label: "Session Management" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 opacity-60 cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-neutral-500" />
                          <div className="flex-1">
                            <h3 className="text-neutral-400 font-semibold">
                              {item.label}
                            </h3>
                            <p className="text-neutral-500 text-xs mt-1">
                              Coming Soon
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                    <h2 className="text-xl font-bold text-white mb-6">
                      Account Settings
                    </h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="w-5 h-5 text-neutral-400" />
                          <span className="text-neutral-300 font-semibold">
                            Email
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm ml-8">
                          {user.email}
                        </p>
                      </div>

                      <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-neutral-400" />
                          <span className="text-neutral-300 font-semibold">
                            Member Since
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm ml-8">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/20">
                    <h3 className="text-lg font-bold text-red-400 mb-4">
                      Danger Zone
                    </h3>
                    <div className="opacity-60 cursor-not-allowed">
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-red-600/50 text-red-300 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
                      >
                        Delete Account
                      </button>
                      <p className="text-red-400 text-xs mt-2">Coming Soon</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
