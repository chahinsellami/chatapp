"use client";

interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

interface MessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function Message({ message, isOwnMessage }: MessageProps) {
  const date = new Date(message.createdAt);
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group hover:bg-[#35373B] rounded-lg p-2 transition -mx-2 px-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#5B65F5] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            {message.username.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="font-semibold text-[#DCDDDE]">{message.username}</p>
            <p className="text-xs text-[#72767D]">{timeString}</p>
          </div>
          <p className="text-[#DCDDDE] break-words whitespace-pre-wrap">
            {message.text}
          </p>
        </div>

        {/* Actions (on hover) */}
        {isOwnMessage && (
          <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
            <button className="p-1 hover:bg-[#5B65F5] rounded text-[#DCDDDE] text-xs hover:text-white">
              ✏️
            </button>
            <button className="p-1 hover:bg-[#F04747] rounded text-[#DCDDDE] text-xs hover:text-white">
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
