"use client";

import { User } from "@/context/AuthContext";
import { useState } from "react";
import Link from "next/link";

interface SidebarProps {
  selectedChannelId: string;
  onChannelSelect: (channelId: string) => void;
  user: User;
}

const channels = [
  { id: "general", name: "general", description: "General discussion" },
  { id: "random", name: "random", description: "Off-topic chat" },
  {
    id: "announcements",
    name: "announcements",
    description: "Important updates",
  },
  { id: "tech", name: "tech", description: "Tech discussions" },
  { id: "gaming", name: "gaming", description: "Gaming talk" },
];

export default function Sidebar({
  selectedChannelId,
  onChannelSelect,
  user,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`flex flex-col bg-[#2F3136] border-r border-[#202225] ${
        isOpen ? "w-72" : "w-20"
      } transition-all duration-300`}
    >
      {/* Server header */}
      <div className="h-16 border-b border-[#202225] flex items-center justify-between px-4">
        <div className={`flex items-center gap-3 ${!isOpen && "hidden"}`}>
          <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#DCDDDE]">WebChat</p>
            <p className="text-xs text-[#72767D]">Server</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-[#35373B] rounded transition"
        >
          <svg
            className="w-4 h-4 text-[#DCDDDE]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isOpen && (
          <div className="px-2 mb-4">
            <p className="text-xs font-bold text-[#72767D] uppercase">
              Channels
            </p>
          </div>
        )}

        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={`w-full px-3 py-2 rounded-lg text-left transition ${
              selectedChannelId === channel.id
                ? "bg-[#5B65F5] text-white"
                : "text-[#DCDDDE] hover:bg-[#35373B]"
            } ${!isOpen && "flex justify-center"}`}
            title={channel.name}
          >
            <span className={`text-sm font-medium ${!isOpen && "hidden"}`}>
              # {channel.name}
            </span>
            {!isOpen && <span className="text-xs font-bold">#</span>}
          </button>
        ))}
      </div>

      {/* User profile section */}
      <div className="border-t border-[#202225] p-3">
        <div
          className={`flex items-center gap-3 p-2 rounded hover:bg-[#35373B] transition cursor-pointer ${
            !isOpen && "flex-col"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#DCDDDE] truncate">
                {user?.username}
              </p>
              <p className="text-xs text-[#72767D] truncate">Online</p>
            </div>
          )}
          {isOpen && (
            <Link
              href="/login"
              className="p-1 hover:bg-[#5B65F5] rounded transition text-xs"
              title="Logout"
            >
              🚪
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
