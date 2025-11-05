"use client";

/**
 * Header Component - Top navigation bar for channel pages
 * 
 * Features:
 * - Displays current channel name and description
 * - Shows user information with avatar
 * - Online status indicator
 * - Logout button with icon
 * - Responsive layout with hover effects
 * 
 * Note: This component appears to be designed for a Discord-style channel system
 * but is not currently used in the messenger/DM flow
 */

import { User } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

/**
 * Props interface for Header component
 */
interface HeaderProps {
  channelId: string; // ID of the current channel
  user: User; // Current user object with username and info
}

/**
 * Channel information lookup table
 * Maps channel IDs to their display names and descriptions
 */
const channelInfo: Record<string, { name: string; description: string }> = {
  general: {
    name: "general",
    description: "General discussion about anything",
  },
  random: { name: "random", description: "Off-topic chat and memes" },
  announcements: {
    name: "announcements",
    description: "Important server announcements",
  },
  tech: { name: "tech", description: "Technology and programming discussions" },
  gaming: { name: "gaming", description: "Video games and gaming content" },
};

/**
 * Header Component
 * Displays channel info and user controls at the top of the page
 */
export default function Header({ channelId, user }: HeaderProps) {
  const router = useRouter();
  
  // Get channel data or use fallback
  const channel = channelInfo[channelId] || {
    name: channelId,
    description: "Channel",
  };

  /**
   * Handle user logout
   * Clears authentication token and redirects to login page
   */
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  return (
    // Header container with Discord-style colors and border
    <div className="h-16 border-b border-[#202225] bg-[#36393F] flex items-center justify-between px-6 smooth depth-1">
      {/* Left side: Channel information */}
      <div className="flex items-center gap-4">
        <div className="fade-in">
          {/* Channel name with pin emoji */}
          <h2 className="text-lg font-bold text-[#DCDDDE] flex items-center gap-2">
            <span className="text-2xl">📍</span>#{channel.name}
          </h2>
          {/* Channel description */}
          <p className="text-xs text-[#72767D]">{channel.description}</p>
        </div>
      </div>

      {/* Right side: User controls */}
      <div className="flex items-center gap-4">
        {/* User info card with avatar and username */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#35373B] transition smooth group cursor-pointer">
          {/* User avatar circle with first letter */}
          <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transform transition smooth">
            <span className="text-white font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          {/* Username and online status */}
          <div className="text-sm">
            <p className="text-[#DCDDDE] font-medium">{user?.username}</p>
            <p className="text-[#43B581] text-xs font-semibold">🟢 Online</p>
          </div>
        </div>

        {/* Logout button with icon */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-[#F04747] hover:bg-opacity-30 rounded-lg transition smooth text-[#F04747] hover:scale-110 transform shadow-md hover:shadow-lg"
          title="Logout"
        >
          {/* Logout icon SVG */}
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
