"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  username: string;
  avatar?: string;
  status: string;
}

interface MembersListProps {
  channelId: string;
}

// Mock members data for now
const mockMembers: Member[] = [
  { id: "1", username: "Alice", status: "online" },
  { id: "2", username: "Bob", status: "online" },
  { id: "3", username: "Charlie", status: "idle" },
  { id: "4", username: "Diana", status: "offline" },
  { id: "5", username: "Eve", status: "online" },
];

const statusColors: Record<string, string> = {
  online: "bg-[#43B581]",
  idle: "bg-[#FAA61A]",
  dnd: "bg-[#F04747]",
  offline: "bg-[#747F8D]",
};

export default function MembersList({ channelId }: MembersListProps) {
  const [members, setMembers] = useState<Member[]>(mockMembers);

  useEffect(() => {
    // TODO: Fetch real members from API
    // setMembers(fetchChannelMembers(channelId));
  }, [channelId]);

  return (
    <div className="w-72 bg-[#2F3136] border-l border-[#202225] flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-[#202225] flex items-center px-6">
        <h3 className="font-semibold text-[#DCDDDE]">
          Members • {members.length}
        </h3>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="px-3 py-2 rounded hover:bg-[#35373B] transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {/* Avatar with status */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#5B65F5] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {member.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2F3136] ${
                    statusColors[member.status]
                  }`}
                ></div>
              </div>

              {/* Username */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#DCDDDE] truncate">
                  {member.username}
                </p>
                <p className="text-xs text-[#72767D]">
                  {member.status.charAt(0).toUpperCase() +
                    member.status.slice(1)}
                </p>
              </div>

              {/* Actions (on hover) */}
              <div className="opacity-0 group-hover:opacity-100 transition">
                <button className="p-1 hover:bg-[#5B65F5] rounded text-[#DCDDDE] text-xs">
                  💬
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Online count */}
      <div className="border-t border-[#202225] p-3 text-center">
        <p className="text-xs text-[#72767D]">
          {members.filter((m) => m.status === "online").length} online
        </p>
      </div>
    </div>
  );
}
