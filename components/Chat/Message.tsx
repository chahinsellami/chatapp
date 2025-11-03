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
    <div className="group hover:bg-[#2F3136] rounded-lg p-3 mx-2 transition smooth slide-in-up">
      <div className="flex items-start gap-3">
        {/* Avatar with glow effect */}
        <div className="relative shrink-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition smooth group-hover:shadow-xl group-hover:scale-110 ${
              isOwnMessage
                ? "bg-[#7289DA] shadow-md"
                : "bg-[#5B65F5] shadow-md"
            }`}
          >
            <span className="text-white font-bold text-base">
              {message.username
                ? message.username.charAt(0).toUpperCase()
                : "?"}
            </span>
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#43B581] rounded-full border-2 border-[#36393F] shadow-md animate-pulse"></div>
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <p className="font-bold text-[#DCDDDE] text-sm hover:underline cursor-pointer transition smooth">
              {message.username || "Unknown User"}
            </p>
            <p className="text-xs text-[#72767D] hover:text-[#B0BEC5] transition smooth cursor-help">
              {timeString}
            </p>
          </div>
          <p className="text-[#DCDDDE] break-words text-sm leading-relaxed">
            {message.text}
          </p>
        </div>

        {/* Actions (on hover) */}
        {isOwnMessage && (
          <div className="opacity-0 group-hover:opacity-100 transition smooth flex gap-1 ml-2 shrink-0">
            <button className="p-2 hover:bg-[#5B65F5] hover:bg-opacity-50 rounded-lg text-base transition smooth transform hover:scale-110" title="Edit message">
              ✏️
            </button>
            <button className="p-2 hover:bg-[#F04747] hover:bg-opacity-50 rounded-lg text-base transition smooth transform hover:scale-110" title="Delete message">
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
