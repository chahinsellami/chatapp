"use client";

/**
 * User Profile View Page - View other users' profiles
 * Allows viewing profile details and sending friend requests
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Check, MessageCircle, ArrowLeft } from "lucide-react";
import NavigationBar from "@/components/Layout/NavigationBar";
import Avatar from "@/components/Common/Avatar";
import Badge from "@/components/Common/Badge";
import Button from "@/components/Common/Button";
import Card from "@/components/Common/Card";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/lib/useSocket";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  cover_image?: string;
  bio?: string;
  status: string;
  created_at: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  // Get online status from Socket.IO
  const { onlineUsers } = useSocket(currentUser?.id || "");
  const isOnline = onlineUsers.has(userId);

  useEffect(() => {
    fetchProfile();
    checkFriendStatus();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const checkFriendStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const friends = data.friends || [];
        setIsFriend(friends.some((f: any) => f.id === userId));
      }
    } catch (error) {
      console.error("Error checking friend status:", error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      setSendingRequest(true);
      const token = localStorage.getItem("auth_token");

      const res = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send friend request");
      }

      setFriendRequestSent(true);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error sending friend request"
      );
    } finally {
      setSendingRequest(false);
    }
  };

  const handleMessage = () => {
    // Redirect to messenger with the friend selected
    router.push(`/messenger?friend=${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <NavigationBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-white">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black">
        <NavigationBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Card className="max-w-md">
            <div className="text-center">
              <p className="text-red-500 mb-4">
                {error || "Profile not found"}
              </p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NavigationBar />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-800 rounded-t-2xl overflow-hidden"
        >
          {profile.cover_image && (
            <img
              src={profile.cover_image}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* Profile Header */}
        <Card className="relative -mt-16 pb-6">
          <div className="flex flex-col md:flex-row items-end md:items-start gap-6 px-6">
            {/* Avatar */}
            <div className="relative -mt-16">
              <div className="w-32 h-32 rounded-full border-4 border-neutral-900 overflow-hidden bg-blue-600 flex items-center justify-center">
                {profile.avatar?.startsWith("/avatars/") ? (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-5xl font-bold">
                    {profile.avatar || profile.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left pt-4">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile.username}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                  <span className="text-neutral-300 text-sm font-medium">
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 text-sm">
                  Member since{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              {profile.bio && (
                <p className="text-neutral-300 max-w-2xl">{profile.bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isFriend ? (
                <Button
                  variant="primary"
                  onClick={handleMessage}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              ) : friendRequestSent ? (
                <Button
                  variant="secondary"
                  disabled
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Request Sent
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSendFriendRequest}
                  loading={sendingRequest}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Friend
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Bio Section */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mt-6">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>
              <p className="text-neutral-300 leading-relaxed">{profile.bio}</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
