"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AddFriend from "@/components/Friends/AddFriend";
import Link from "next/link";

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateUser } = useAuth();
  const [avatar, setAvatar] = useState("");
  const [status, setStatus] = useState("online");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState("profile");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
      setStatus(user.status || "online");
      setBio(user.bio || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
    }
  }, [user]);

  const fetchPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setAcceptingId(requestId);
      const token = localStorage.getItem("auth_token");

      const res = await fetch(
        `/api/friends/requests/${requestId}?action=accept`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        setError("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      setError("Error accepting request");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(
        `/api/friends/requests/${requestId}?action=reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleSave = async () => {
    if (!avatar) {
      setError("Select avatar");
      return;
    }
    try {
      setSaving(true);
      setError("");
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
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      updateUser(data.user);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#36393F]">
        <div className="animate-spin h-12 w-12 border-b-2 border-[#5B65F5] rounded-full"></div>
      </div>
    );
  if (!user) return null;

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background:
          "linear-gradient(135deg, #1a1d23 0%, #2F3136 50%, #202225 100%)",
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 max-w-6xl mx-auto gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">My Hub</h1>
        <button
          onClick={() => {
            localStorage.removeItem("auth_token");
            router.push("/login");
          }}
          className="w-full md:w-auto px-4 py-2 bg-[#F04747] text-white rounded-lg text-sm md:text-base"
        >
          Logout
        </button>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[#36393F] rounded-xl p-3 md:p-6 border border-[#40444B]">
            <button
              onClick={() => setTab("profile")}
              className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold mb-2 transition text-sm md:text-base ${
                tab === "profile"
                  ? "bg-[#5B65F5] text-white"
                  : "bg-[#40444B] text-[#DCDDDE]"
              }`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setTab("friends")}
              className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold transition text-sm md:text-base ${
                tab === "friends"
                  ? "bg-[#5B65F5] text-white"
                  : "bg-[#40444B] text-[#DCDDDE]"
              }`}
            >
              👥 Friends
            </button>
            <button
              onClick={() => setTab("requests")}
              className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold mt-2 transition text-sm md:text-base ${
                tab === "requests"
                  ? "bg-[#5B65F5] text-white"
                  : "bg-[#40444B] text-[#DCDDDE]"
              }`}
            >
              📬 Requests
            </button>
            <Link
              href="/messenger"
              className="block px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold bg-[#40444B] text-[#DCDDDE] text-center mt-2 hover:bg-[#35373B] transition text-sm md:text-base"
            >
              💬 Go to DMs
            </Link>
          </div>
          <div className="bg-[#36393F] rounded-xl p-3 md:p-6 border border-[#40444B] mt-6 text-center">
            <div className="text-4xl md:text-6xl mb-4">
              {user.avatar || "👤"}
            </div>
            <p className="text-[#DCDDDE] font-bold text-sm md:text-base">
              {user.username}
            </p>
            <p className="text-[#72767D] text-xs md:text-sm">{user.email}</p>
            {user.bio && (
              <p className="text-[#B0BEC5] text-xs md:text-sm mt-3">
                "{user.bio}"
              </p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          {tab === "profile" && (
            <div className="bg-[#36393F] rounded-xl p-4 md:p-8 border border-[#40444B]">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                Update Profile
              </h2>
              {success && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded">
                  <p className="text-green-300">✅ Saved!</p>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-[#F04747]/20 border border-[#F04747] rounded">
                  <p className="text-[#FF6B6B]">⚠️ {error}</p>
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#DCDDDE] mb-3">
                    🎨 Avatar
                  </label>
                  <div className="grid grid-cols-6 md:grid-cols-8 gap-1 md:gap-2 p-2 md:p-3 bg-[#2F3136] rounded max-h-48 overflow-y-auto">
                    {AVATARS.map((o) => (
                      <button
                        key={o}
                        onClick={() => setAvatar(o)}
                        className={`p-1 md:p-2 text-lg md:text-xl rounded ${
                          avatar === o ? "bg-[#5B65F5]" : "bg-[#40444B]"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                {avatar && (
                  <div className="p-4 bg-[#2F3136] rounded text-center">
                    <p className="text-[#72767D]">Selected</p>
                    <div className="text-5xl">{avatar}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-[#DCDDDE] mb-2">
                    📍 Status
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { v: "online", l: "🟢 Online" },
                      { v: "idle", l: "🟡 Idle" },
                      { v: "dnd", l: "🔴 DND" },
                      { v: "invisible", l: "⚫ Invisible" },
                    ].map((s) => (
                      <button
                        key={s.v}
                        onClick={() => setStatus(s.v)}
                        className={`p-2 md:p-3 rounded ${
                          status === s.v ? "bg-[#5B65F5]" : "bg-[#40444B]"
                        }`}
                      >
                        <p className="text-[#DCDDDE] text-xs md:text-sm">
                          {s.l}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#DCDDDE] mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={150}
                    className="w-full px-3 py-2 bg-[#40444B] border border-[#202225] text-[#DCDDDE] rounded text-xs md:text-sm"
                    rows={3}
                  />
                  <p className="text-[#72767D] text-xs mt-1">
                    {bio.length}/150
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2 md:py-3 bg-[#5B65F5] text-white font-bold rounded disabled:opacity-50 text-sm md:text-base"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
          {tab === "friends" && (
            <div className="bg-[#36393F] rounded-xl p-4 md:p-8 border border-[#40444B]">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                Add Friends
              </h2>
              <AddFriend userId={user.id} />
            </div>
          )}
          {tab === "requests" && (
            <div className="bg-[#36393F] rounded-xl p-4 md:p-8 border border-[#40444B]">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                Friend Requests
              </h2>
              <div className="text-[#DCDDDE]">
                <p>📬 You have no pending friend requests.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
