"use client";

/**
 * Settings Page - User profile customization
 *
 * Features:
 * - Avatar selection from emoji gallery or custom upload
 * - Cover photo upload
 * - Status management (online, idle, dnd, invisible)
 * - Bio editing
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const NavigationBar = dynamic(
  () => import("@/components/Layout/NavigationBar"),
  { ssr: false }
);
const Card = dynamic(() => import("@/components/Common/Card"), { ssr: false });
const Button = dynamic(() => import("@/components/Common/Button"), {
  ssr: false,
});
const TextArea = dynamic(() => import("@/components/Common/TextArea"), {
  ssr: false,
});
const ImageUpload = dynamic(() => import("@/components/Common/ImageUpload"), {
  ssr: false,
});
const EmojiPicker = dynamic(() => import("@/components/Common/EmojiPicker"), {
  ssr: false,
});
const StatusSelector = dynamic(
  () => import("@/components/Common/StatusSelector"),
  { ssr: false }
);
const AlertMessage = dynamic(() => import("@/components/Common/AlertMessage"), {
  ssr: false,
});
const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false }
);
import { LoadingSpinner } from "@/components/Common";
import type { StatusOption } from "@/components/Common";
import { User, Save, ArrowLeft } from "lucide-react";

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
const STATUS_OPTIONS: StatusOption[] = [
  { value: "online", label: "Online", icon: "🟢", color: "#10b981" },
  { value: "idle", label: "Idle", icon: "🟡", color: "#f59e0b" },
  { value: "dnd", label: "Do Not Disturb", icon: "🔴", color: "#ef4444" },
  { value: "invisible", label: "Invisible", icon: "⚫", color: "#6b7280" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, updateUser } = useAuth();

  // Profile state
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("online");
  const [bio, setBio] = useState("");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /**
   * Initialize profile data from user context
   */
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      if (user.avatar) {
        setAvatar(user.avatar);
        setStatus(user.status || "online");
        setBio(user.bio || "");
        if (
          user.avatar.startsWith("/avatars/") ||
          user.avatar.startsWith("http")
        ) {
          setCustomImage(user.avatar);
        }
        if (user.coverImage) {
          setCoverImage(user.coverImage);
        }
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

  /**
   * Handle cover image file selection
   */
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Remove custom image
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

      // Check if username is taken (unless unchanged)
      if (username !== user?.username) {
        const checkRes = await fetch(
          `/api/users/search?q=${encodeURIComponent(username)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const checkData = await checkRes.json();
        if (
          checkData.users &&
          checkData.users.some(
            (u: any) => u.username.toLowerCase() === username.toLowerCase()
          )
        ) {
          setError("Username already exists. Please choose another.");
          setSaving(false);
          return;
        }
      }

      let profileImageUrl = customImage || avatar;
      let coverImageUrl = coverImage || "";

      // Upload profile image if a new file was selected
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
          throw new Error(data.error || "Failed to upload profile image");
        }

        const uploadData = await uploadRes.json();
        profileImageUrl = uploadData.imageUrl;
      }

      // Upload cover image if a new file was selected
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);

        const uploadRes = await fetch("/api/upload/cover-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error || "Failed to upload cover image");
        }

        const uploadData = await uploadRes.json();
        coverImageUrl = uploadData.imageUrl;
      }

      // Save profile with the uploaded image URLs
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          avatar: profileImageUrl,
          coverImage: coverImageUrl,
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

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner icon={User} message="Loading Settings..." />;
  }

  if (!user) return null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <div className="min-h-screen bg-black">
        {/* Header */}
        <NavigationBar currentPage="settings" />

        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/profile")}
            icon={ArrowLeft}
          />
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card padding="lg">
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
                <ImageUpload
                  label="Profile Picture"
                  preview={
                    customImage ||
                    (avatar && !avatar.startsWith("http") ? null : customImage)
                  }
                  onUpload={handleImageChange}
                  onRemove={handleRemoveImage}
                  id="avatar-upload-settings"
                  placeholder="No profile picture"
                />

                <ImageUpload
                  label="Cover Photo"
                  preview={coverImage}
                  onUpload={handleCoverImageChange}
                  onRemove={handleRemoveCoverImage}
                  id="cover-upload-settings"
                  placeholder="No cover photo"
                />
              </div>

              {/* Emoji Avatar Selection */}
              {!customImage && (
                <EmojiPicker
                  label="Or Choose an Emoji Avatar"
                  emojis={AVATARS}
                  value={avatar}
                  onChange={(emoji) => {
                    setAvatar(emoji);
                    setCustomImage(null);
                  }}
                />
              )}

              {/* Username Change */}
              <div>
                <label
                  className="block text-white font-medium mb-2"
                  htmlFor="username-settings"
                >
                  Username
                </label>
                <input
                  id="username-settings"
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.replace(/\s+/g, "").toLowerCase()
                    )
                  }
                  minLength={3}
                  maxLength={32}
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
                <p className="text-neutral-400 text-xs mt-1">
                  Username must be unique and 3-32 characters, no spaces.
                </p>
              </div>

              {/* Status Selection */}
              <StatusSelector
                label="Your Status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
              />

              {/* Bio */}
              <TextArea
                label="About You"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                placeholder="Tell everyone about yourself..."
                rows={4}
                showCount
              />

              {/* Save Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={saving}
                icon={Save}
                onClick={handleSave}
              >
                Save Profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Suspense>
  );
}
