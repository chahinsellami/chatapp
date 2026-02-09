"use client";

/**
 * User Profile View Page - View other users' profiles
 * Allows viewing profile details and sending friend requests
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Check, MessageCircle, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
const NavigationBar = dynamic(
  () => import("@/components/Layout/NavigationBar"),
  { ssr: false }
);
const Avatar = dynamic(() => import("@/components/Common/Avatar"), {
  ssr: false,
});
const Badge = dynamic(() => import("@/components/Common/Badge"), {
  ssr: false,
});
const Button = dynamic(() => import("@/components/Common/Button"), {
  ssr: false,
});
const Card = dynamic(() => import("@/components/Common/Card"), { ssr: false });
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

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image: string | null;
  likes: number;
  created_at: string;
  username: string;
  avatar: string;
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
  const [checkingFriendStatus, setCheckingFriendStatus] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Get online status from Socket.IO
  const { onlineUsers } = useSocket(currentUser?.id || "");
  const isOnline = onlineUsers.has(userId);

  useEffect(() => {
    fetchProfile();
    checkFriendStatus();
    fetchUserPosts();
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
      setCheckingFriendStatus(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const friends = data.friends || [];
        const pending = data.pendingRequests || [];
        
        // Check if already friends
        const isAlreadyFriend = friends.some((f: any) => f.id === userId);
        setIsFriend(isAlreadyFriend);
        
        // Check if a friend request was already sent (by current user to this profile)
        // or received (from this profile to current user)
        if (!isAlreadyFriend) {
          const hasPendingRequest = pending.some(
            (r: any) => r.sender_id === userId || r.sender?.id === userId
          );
          // Also check if current user sent a request to this profile
          const sentRes = await fetch("/api/friends/sent", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);
          
          if (sentRes?.ok) {
            const sentData = await sentRes.json();
            const sentRequests = sentData.sentRequests || [];
            const hasSentRequest = sentRequests.some(
              (r: any) => r.receiver_id === userId
            );
            if (hasSentRequest || hasPendingRequest) {
              setFriendRequestSent(true);
            }
          } else if (hasPendingRequest) {
            setFriendRequestSent(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking friend status:", error);
    } finally {
      setCheckingFriendStatus(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`/api/posts?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      // Error fetching posts: (error)
    } finally {
      setLoadingPosts(false);
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-br from-blue-600 to-blue-800 rounded-t-2xl overflow-hidden"
        >
          {profile.cover_image && (
            <Image
              src={profile.cover_image}
              alt="Cover"
              className="w-full h-full object-cover"
              fill
              sizes="100vw"
              priority
            />
          )}
        </motion.div>

        {/* Profile Header */}
        <Card className="relative -mt-12 sm:-mt-16 pb-6">
          <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-6 px-4 sm:px-6">
            {/* Avatar */}
            <div className="relative -mt-12 sm:-mt-16">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-neutral-900 overflow-hidden bg-blue-600 flex items-center justify-center">
                {profile.avatar &&
                (profile.avatar.startsWith("http") ||
                  profile.avatar.startsWith("/")) ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                    fill
                    sizes="96px"
                  />
                ) : (
                  <span className="text-white text-4xl sm:text-5xl font-bold">
                    {profile.avatar || profile.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4 w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {profile.username}
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-4">
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
                <span className="text-neutral-500 hidden sm:inline">•</span>
                <span className="text-neutral-400 text-xs sm:text-sm">
                  Member since{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              {profile.bio && (
                <p className="text-neutral-300 max-w-2xl text-sm sm:text-base">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 w-full sm:w-auto justify-center sm:justify-start">
              {checkingFriendStatus ? (
                <Button variant="secondary" disabled className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </Button>
              ) : isFriend ? (
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

        {/* Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
            {loadingPosts ? (
              <p className="text-neutral-400 text-center py-8">
                Loading posts...
              </p>
            ) : posts.length === 0 ? (
              <p className="text-neutral-400 text-center py-8">No posts yet</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const getImageUrl = (url: string | null) => {
                    if (!url) return null;
                    if (url.startsWith("http")) return url;
                    if (
                      url.startsWith("/upload/") ||
                      url.startsWith("upload/")
                    ) {
                      const cleanPath = url.startsWith("/")
                        ? url.substring(1)
                        : url;
                      return `https://res.cloudinary.com/dhgsxwtwv/image/${cleanPath}`;
                    }
                    return url;
                  };

                  const imageUrl = getImageUrl(post.image);

                  return (
                    <div
                      key={post.id}
                      className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700"
                    >
                      {/* Post Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
                          {post.avatar &&
                          (post.avatar.startsWith("http") ||
                            post.avatar.startsWith("/")) ? (
                            <Image
                              src={post.avatar}
                              alt={post.username}
                              className="w-full h-full object-cover"
                              width={40}
                              height={40}
                            />
                          ) : (
                            <span className="text-white text-lg">
                              {post.avatar || "👤"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm">
                            {post.username}
                          </h4>
                          <p className="text-xs text-neutral-400">
                            {new Date(post.created_at).toLocaleDateString()} at{" "}
                            {new Date(post.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Post Content */}
                      {post.content && (
                        <p className="text-white mb-3 whitespace-pre-wrap break-words text-sm">
                          {post.content}
                        </p>
                      )}

                      {/* Post Image */}
                      {imageUrl && (
                        <div className="rounded-lg overflow-hidden mb-3 bg-neutral-900">
                          <Image
                            src={imageUrl}
                            alt="Post"
                            className="w-full h-auto max-h-96 object-contain"
                            width={600}
                            height={400}
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-4 pt-3 border-t border-neutral-700">
                        <span className="text-neutral-400 text-sm">
                          ❤️ {post.likes || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
