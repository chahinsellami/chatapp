"use client";

import { MOCK_USERS, getStatusColor } from "../lib/users";
import type { User } from "../lib/users";
import Image from "next/image";

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (userId: string) => void;
  currentUserId: string; // ID of the currently logged-in user
}

/**
 * Sidebar Component
 *
 * This component displays:
 * - A list of all available users
 * - Each user's avatar, name, and online status
 * - Highlights the currently selected user for chatting
 * - Shows status indicators (online/away/offline)
 *
 * Props:
 * - selectedUserId: The currently selected user to chat with
 * - onSelectUser: Callback function when user clicks on a user to chat
 * - currentUserId: ID of the logged-in user (to exclude from list or show as "Me")
 */
export default function Sidebar({
  selectedUserId,
  onSelectUser,
  currentUserId,
}: SidebarProps) {
  // Filter out the current user and get the list of other users
  const otherUsers = MOCK_USERS.filter((user) => user.id !== currentUserId);

  return (
    // Sidebar container - fixed width, full height, with border
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Header section - Search and title */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chats</h2>

        {/* Search input - allows filtering users */}
        <input
          type="text"
          placeholder="Search users..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users list container - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Map through each user and render a user item */}
        {otherUsers.map((user: User) => (
          // User item container - clickable
          <div
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            // Conditional styling: highlight selected user with blue background
            className={`
              px-4 py-3 border-b border-gray-100 cursor-pointer transition
              ${
                selectedUserId === user.id
                  ? "bg-blue-50 border-l-4 border-l-blue-500"
                  : "hover:bg-gray-50"
              }
            `}
          >
            {/* User item content - flex row with avatar and info */}
            <div className="flex items-center gap-3">
              {/* Avatar container - relative for status indicator */}
              <div className="relative flex-shrink-0">
                {/* User's profile picture - using Next.js Image component for optimization */}
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={48}
                  height={48}
                  unoptimized
                  className="w-12 h-12 rounded-full object-cover"
                />

                {/* Status indicator - small colored dot */}
                <div
                  className={`
                    absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                    ${getStatusColor(user.status)}
                  `}
                />
              </div>

              {/* User info - name and status text */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.status === "offline" && user.lastSeen
                    ? `Last seen ${new Date(
                        user.lastSeen
                      ).toLocaleTimeString()}`
                    : user.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
