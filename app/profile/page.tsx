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
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white">My Hub</h1>
        <button
          onClick={() => {
            localStorage.removeItem("auth_token");
            router.push("/login");
          }}
          className="px-4 py-2 bg-[#F04747] text-white rounded-lg"
        >
          Logout
        </button>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[#36393F] rounded-xl p-6 border border-[#40444B]">
            <button
              onClick={() => setTab("profile")}
              className={`w-full px-4 py-3 rounded-lg font-bold mb-2 transition ${
                tab === "profile"
                  ? "bg-[#5B65F5] text-white"
                  : "bg-[#40444B] text-[#DCDDDE]"
              }`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setTab("friends")}
              className={`w-full px-4 py-3 rounded-lg font-bold transition ${
                tab === "friends"
                  ? "bg-[#5B65F5] text-white"
                  : "bg-[#40444B] text-[#DCDDDE]"
              }`}
            >
              👥 Friends
            </button>
            <Link
              href="/messenger"
              className="block px-4 py-3 rounded-lg font-bold bg-[#40444B] text-[#DCDDDE] text-center mt-2 hover:bg-[#35373B] transition"
            >
              💬 Go to DMs
            </Link>
          </div>
          <div className="bg-[#36393F] rounded-xl p-6 border border-[#40444B] mt-6 text-center">
            <div className="text-6xl mb-4">{user.avatar || "👤"}</div>
            <p className="text-[#DCDDDE] font-bold">{user.username}</p>
            <p className="text-[#72767D] text-sm">{user.email}</p>
            {user.bio && (
              <p className="text-[#B0BEC5] text-sm mt-3">"{user.bio}"</p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          {tab === "profile" && (
            <div className="bg-[#36393F] rounded-xl p-8 border border-[#40444B]">
              <h2 className="text-2xl font-bold text-white mb-6">
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
                  <div className="grid grid-cols-8 gap-2 p-3 bg-[#2F3136] rounded max-h-48 overflow-y-auto">
                    {AVATARS.map((o) => (
                      <button
                        key={o}
                        onClick={() => setAvatar(o)}
                        className={`p-2 text-xl rounded ${
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
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: "online", l: "🟢 Online" },
                      { v: "idle", l: "🟡 Idle" },
                      { v: "dnd", l: "🔴 DND" },
                      { v: "invisible", l: "⚫ Invisible" },
                    ].map((s) => (
                      <button
                        key={s.v}
                        onClick={() => setStatus(s.v)}
                        className={`p-2 rounded ${
                          status === s.v ? "bg-[#5B65F5]" : "bg-[#40444B]"
                        }`}
                      >
                        <p className="text-[#DCDDDE] text-sm">{s.l}</p>
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
                    className="w-full px-3 py-2 bg-[#40444B] border border-[#202225] text-[#DCDDDE] rounded text-sm"
                    rows={3}
                  />
                  <p className="text-[#72767D] text-xs mt-1">
                    {bio.length}/150
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-[#5B65F5] text-white font-bold rounded disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
          {tab === "friends" && (
            <div className="bg-[#36393F] rounded-xl p-8 border border-[#40444B]">
              <h2 className="text-2xl font-bold text-white mb-6">
                Add Friends
              </h2>
              <AddFriend userId={user.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
