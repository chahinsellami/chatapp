"use client";

import { User } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface HeaderProps {
  channelId: string;
  user: User;
}

const channelInfo: Record<string, { name: string; description: string }> = {
  general: { name: "general", description: "General discussion about anything" },
  random: { name: "random", description: "Off-topic chat and memes" },
  announcements: { name: "announcements", description: "Important server announcements" },
  tech: { name: "tech", description: "Technology and programming discussions" },
  gaming: { name: "gaming", description: "Video games and gaming content" },
};

export default function Header({ channelId, user }: HeaderProps) {
  const router = useRouter();
  const channel = channelInfo[channelId] || { name: channelId, description: "Channel" };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  return (
    <div className="h-16 border-b border-[#202225] bg-[#36393F] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#DCDDDE]">
            #{channel.name}
          </h2>
          <p className="text-xs text-[#72767D]">
            {channel.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-2 rounded hover:bg-[#35373B] transition">
          <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="text-sm">
            <p className="text-[#DCDDDE] font-medium">{user?.username}</p>
            <p className="text-[#72767D] text-xs">Online</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-[#F04747] hover:bg-opacity-20 rounded transition text-[#F04747]"
          title="Logout"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
