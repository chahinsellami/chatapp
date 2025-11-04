"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/lib/useSocket";
import { useWebRTC } from "@/lib/useWebRTC";

interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  username: string;
  avatar?: string;
  createdAt: string;
  editedAt?: string;
}

interface DirectMessagesProps {
  userId: string;
  friendId: string;
  friendName: string;
  friendAvatar?: string;
  friendStatus?: string;
}

export default function DirectMessages({
  userId,
  friendId,
  friendName,
  friendAvatar = "👤",
  friendStatus = "offline",
}: DirectMessagesProps) {
  // Debug logging
  console.log("🔍 DirectMessages props:", {
    userId,
    friendId,
    friendName,
    userIdType: typeof userId,
    friendIdType: typeof friendId,
  });

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string>("😊");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Socket.IO connection
  const { socket, isConnected, sendMessage, sendTypingIndicator, typingUsers, onlineUsers } =
    useSocket(userId);

  // WebRTC for voice/video calls
  const {
    isCallActive,
    isIncomingCall,
    callType,
    callerInfo,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC({ socket, userId });

  // Set video streams
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Fetch messages on mount and friendId change
  useEffect(() => {
    if (friendId && userId) {
      fetchMessages();
      fetchUserAvatar();
    }
  }, [friendId, userId]);

  // Fetch user's avatar
  const fetchUserAvatar = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user?.avatar) {
          setUserAvatar(data.user.avatar);
        }
      }
    } catch (error) {
      console.error("Error fetching user avatar:", error);
    }
  };

  // Listen for new messages from Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      console.log("📨 Message received via socket:", message);

      // Check if message is for this conversation
      if (
        (message.senderId === friendId && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === friendId)
      ) {
        const formattedMessage: DirectMessage = {
          id: message.messageId,
          senderId: message.senderId,
          receiverId: message.receiverId,
          text: message.text,
          createdAt: message.createdAt,
          username: message.senderId === userId ? "You" : friendName,
          avatar: message.senderId === userId ? undefined : friendAvatar,
        };

        // Only add if not already in messages (prevent duplicates)
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === formattedMessage.id);
          if (exists) {
            console.log("Message already exists, skipping");
            return prev;
          }
          console.log("Adding message to state");
          return [...prev, formattedMessage];
        });
      }
    };

    socket.on("receive-message", handleNewMessage);

    return () => {
      socket.off("receive-message", handleNewMessage);
    };
  }, [socket, userId, friendId, friendName, friendAvatar]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch(`/api/messages/direct/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();

      console.log("📥 Fetched messages data:", data);

      // Format messages
      const formattedMessages = (data.messages || []).map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        text: msg.text,
        createdAt: msg.created_at,
        editedAt: msg.edited_at,
        username: msg.sender_id === userId ? "You" : msg.username || friendName,
        avatar:
          msg.sender_id === userId ? undefined : msg.avatar || friendAvatar,
      }));

      console.log("📥 Formatted messages:", formattedMessages.length);

      setMessages(formattedMessages);
      setError(null);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Error loading messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      console.log("📤 Sending message to:", friendId);

      // Send to database first
      const res = await fetch(`/api/messages/direct/${friendId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const newMessage = await res.json();

      // Format message
      const formattedMessage: DirectMessage = {
        id: newMessage.id,
        senderId: userId,
        receiverId: friendId,
        text: text,
        createdAt: newMessage.created_at || new Date().toISOString(),
        username: "You",
      };

      // Add to local state immediately (for sender)
      setMessages((prev) => [...prev, formattedMessage]);

      // Send via Socket.IO for real-time delivery to receiver
      if (socket && isConnected) {
        console.log("📡 Emitting via socket.io");
        sendMessage({
          messageId: newMessage.id,
          senderId: userId,
          receiverId: friendId,
          text: text,
          createdAt: formattedMessage.createdAt,
        });
      } else {
        console.warn("Socket not connected!");
      }

      setMessageText("");
      setError(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error sending message";
      setError(errorMsg);
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    // Send typing indicator
    if (socket && isConnected) {
      sendTypingIndicator(friendId, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(friendId, false);
      }, 2000);
    }
  };

  const isTyping = typingUsers.has(friendId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#36393F]">
        <div className="animate-spin h-12 w-12 border-b-2 border-[#5B65F5] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#2F3136] to-[#36393F]">
      {/* Header with enhanced styling */}
      <div className="flex justify-between items-center p-4 border-b border-[#202225]/50 backdrop-blur-sm bg-[#2F3136]/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="relative hover-lift">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B65F5] to-[#7289DA] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
              {friendAvatar?.startsWith("/avatars/") ? (
                <img
                  src={friendAvatar}
                  alt={friendName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">{friendAvatar || "👤"}</span>
              )}
            </div>
            {/* Enhanced online indicator */}
            {isConnected && onlineUsers.has(friendId) && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#43B581] rounded-full border-2 border-[#2F3136] animate-pulse shadow-lg"></div>
            )}
          </div>
          <div>
            <h3 className="text-white font-bold text-base md:text-lg">
              {friendName}
            </h3>
            <p className="text-[#72767D] text-xs flex items-center gap-1">
              {isConnected ? (
                onlineUsers.has(friendId) ? (
                  <>
                    <span className="w-2 h-2 bg-[#43B581] rounded-full animate-pulse"></span>
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-[#747F8D] rounded-full"></span>
                    <span>Offline</span>
                  </>
                )
              ) : (
                <span>Connecting...</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => startCall(friendId, "voice")}
            disabled={isCallActive}
            className="px-3 py-2 bg-gradient-to-r from-[#43B581] to-[#3BA55D] text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Voice Call"
          >
            📞
          </button>
          <button
            onClick={() => startCall(friendId, "video")}
            disabled={isCallActive}
            className="px-3 py-2 bg-gradient-to-r from-[#5B65F5] to-[#4752C4] text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Video Call"
          >
            📹
          </button>
        </div>
      </div>

      {/* Messages area with enhanced scrollbar */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#5B65F5 #2F3136",
        }}
      >
        {messages.map((message) => {
          const isOwnMessage = message.senderId === userId;
          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                isOwnMessage ? "flex-row-reverse" : "flex-row"
              } animate-fadeIn`}
            >
              {/* Avatar with glow effect */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B65F5] to-[#7289DA] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg hover-glow">
                {isOwnMessage ? (
                  userAvatar?.startsWith("/avatars/") ? (
                    <img
                      src={userAvatar}
                      alt="You"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">{userAvatar || "😊"}</span>
                  )
                ) : friendAvatar?.startsWith("/avatars/") ? (
                  <img
                    src={friendAvatar}
                    alt={friendName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg">{friendAvatar || "👤"}</span>
                )}
              </div>

              {/* Enhanced message bubble */}
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                  isOwnMessage
                    ? "bg-gradient-to-br from-[#5B65F5] to-[#4752C4] text-white hover-lift"
                    : "modern-card text-white"
                }`}
              >
                <p className="break-words whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                  {message.text}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage ? "text-gray-200" : "text-[#72767D]"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-[#72767D] text-sm animate-fadeIn">
            <span className="text-lg">{friendAvatar || "👤"}</span>
            <span className="italic">{friendName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-500/20 border-t border-red-500">
          <p className="text-red-300 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="p-4 border-t border-[#202225]/50 backdrop-blur-sm bg-[#2F3136]/80">
        <div className="flex gap-3">
          <textarea
            value={messageText}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${friendName}...`}
            className="flex-1 bg-[#40444B] text-[#DCDDDE] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5B65F5]/50 transition-all duration-200 placeholder:text-[#72767D]"
            rows={2}
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !messageText.trim()}
            className="px-6 py-3 bg-gradient-to-r from-[#5B65F5] to-[#4752C4] text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold flex items-center gap-2"
          >
            {sending ? (
              <>
                <span className="animate-spin">⏳</span>
                <span className="hidden md:inline">Sending...</span>
              </>
            ) : (
              <>
                <span>📨</span>
                <span className="hidden md:inline">Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {isIncomingCall && callerInfo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#36393F] rounded-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Incoming {callType === "video" ? "Video" : "Voice"} Call
            </h2>
            <p className="text-[#DCDDDE] mb-6">{friendName} is calling...</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={acceptCall}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Modal */}
      {isCallActive && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
          <div className="text-white text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">
              {callType === "video" ? "Video" : "Voice"} Call with {friendName}
            </h2>
          </div>

          {/* Video Streams */}
          {callType === "video" && (
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden mb-4">
              {/* Remote Video (Full Screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {callType === "voice" && (
            <>
              <div className="text-white text-6xl mb-8">📞</div>
              {/* Hidden audio elements for voice calls */}
              <audio ref={localVideoRef} autoPlay muted />
              <audio ref={remoteVideoRef} autoPlay />
            </>
          )}

          {/* Call Controls */}
          <div className="flex gap-4">
            <button
              onClick={toggleAudio}
              className="px-6 py-3 bg-[#5B65F5] text-white rounded-lg hover:bg-[#4752C4] font-bold"
            >
              🎤 Mute
            </button>
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className="px-6 py-3 bg-[#5B65F5] text-white rounded-lg hover:bg-[#4752C4] font-bold"
              >
                📹 Camera
              </button>
            )}
            <button
              onClick={endCall}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
