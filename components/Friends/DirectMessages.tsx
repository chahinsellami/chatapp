"use client";

/**
 * Direct Messages Component - Main messaging interface between two users
 * Features real-time messaging via Socket.IO, voice/video calling via WebRTC,
 * typing indicators, online status, and mobile-responsive design with modern UI
 */

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/lib/useSocket";
import { useWebRTC } from "@/lib/useWebRTC";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Video,
  Send,
  AlertCircle,
  PhoneOff,
  VideoOff,
  Mic,
  MicOff,
  MoreVertical,
  Smile,
  MessageCircle,
  ChevronDown,
  Check,
} from "lucide-react";

/**
 * Interface for direct message data structure
 */
interface DirectMessage {
  id: string; // Unique message identifier
  senderId: string; // ID of user who sent the message
  receiverId: string; // ID of user who should receive the message
  text: string; // Message content
  username: string; // Display name of sender
  avatar?: string; // Avatar URL of sender
  createdAt: string; // Message timestamp
  editedAt?: string; // Edit timestamp (if message was edited)
}

// Status options for status dropdown
const STATUS_OPTIONS = [
  { value: "online", label: "Online", icon: "🟢", color: "#10b981" },
  { value: "idle", label: "Idle", icon: "🟡", color: "#f59e0b" },
  { value: "dnd", label: "Do Not Disturb", icon: "🔴", color: "#ef4444" },
  { value: "invisible", label: "Invisible", icon: "⚫", color: "#6b7280" },
];

/**
 * Props interface for DirectMessages component
 */
interface DirectMessagesProps {
  userId: string; // Current user's ID
  friendId: string; // Friend's user ID for this conversation
  friendName: string; // Friend's display name
  friendAvatar?: string; // Friend's avatar (defaults to emoji)
  friendStatus?: string; // Friend's online status
}

/**
 * Main Direct Messages Component
 * Handles private messaging, real-time updates, and voice/video calls
 */
export default function DirectMessages({
  userId,
  friendId,
  friendName,
  friendAvatar = "👤",
  friendStatus = "offline",
}: DirectMessagesProps) {
  // Message state management
  const [messages, setMessages] = useState<DirectMessage[]>([]); // Array of conversation messages
  const [messageText, setMessageText] = useState(""); // Current message being typed
  const [sending, setSending] = useState(false); // Whether a message is being sent
  const [error, setError] = useState<string | null>(null); // Error message display
  const [loading, setLoading] = useState(true); // Initial loading state
  const [showStatusDropdown, setShowStatusDropdown] = useState(false); // Status dropdown visibility

  // User interface state
  const [userAvatar, setUserAvatar] = useState<string>("??"); // Current user's avatar
  const [isMobile, setIsMobile] = useState(false); // Mobile device detection

  // Auth context for user status
  const { user, updateUser } = useAuth();

  // DOM references for scrolling and video elements
  const messagesEndRef = useRef<HTMLDivElement>(null); // Reference for auto-scrolling
  const localVideoRef = useRef<HTMLVideoElement>(null); // Local video stream element
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // Remote video stream element
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Typing indicator timeout
  const statusDropdownRef = useRef<HTMLDivElement>(null); // Status dropdown reference

  // Detect mobile device for responsive behavior and warnings
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Initialize Socket.IO connection for real-time messaging
  const {
    socket,
    isConnected,
    sendMessage,
    sendTypingIndicator,
    typingUsers,
    onlineUsers,
  } = useSocket(userId);

  // Initialize WebRTC connection for voice/video calls
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

  // Set up local video stream when available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote video stream when available
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (friendId && userId) {
      fetchMessages();
      fetchUserAvatar();
    }
  }, [friendId, userId]);

  /**
   * Fetch current user's avatar for message display
   */
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
      console.error("Failed to fetch user avatar:", error);
    }
  };

  // Listen for real-time messages from Socket.IO
  useEffect(() => {
    if (!socket) return;

    /**
     * Handle incoming messages from Socket.IO
     * Only processes messages for the current conversation
     */
    const handleNewMessage = (message: any) => {
      // Check if message belongs to this conversation
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

        // Prevent duplicate messages
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === formattedMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, formattedMessage];
        });
      }
    };

    socket.on("receive-message", handleNewMessage);

    return () => {
      socket.off("receive-message", handleNewMessage);
    };
  }, [socket, userId, friendId, friendName, friendAvatar]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Fetch conversation history from the server
   * Loads existing messages when opening a conversation
   */
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

      // Format messages for display
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

      setMessages(formattedMessages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading messages");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send a new message to the conversation
   * Saves to database first, then broadcasts via Socket.IO
   */
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

      // Send message to server/database first
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

      // Format message for local display
      const formattedMessage: DirectMessage = {
        id: newMessage.id,
        senderId: userId,
        receiverId: friendId,
        text: text,
        createdAt: newMessage.created_at || new Date().toISOString(),
        username: "You",
      };

      // Add to local state immediately for instant UI feedback
      setMessages((prev) => [...prev, formattedMessage]);

      // Broadcast message via Socket.IO for real-time delivery
      if (socket && isConnected) {
        sendMessage({
          messageId: newMessage.id,
          senderId: userId,
          receiverId: friendId,
          text: text,
          createdAt: formattedMessage.createdAt,
        });
      }

      setMessageText("");
      setError(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error sending message";
      setError(errorMsg);
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle Enter key press for sending messages
   * Shift+Enter for new line, Enter alone to send
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle typing input with real-time typing indicators
   * Sends typing status to other user and clears after timeout
   */
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    // Send typing indicator via Socket.IO
    if (socket && isConnected) {
      sendTypingIndicator(friendId, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(friendId, false);
      }, 2000);
    }
  };

  // Check if friend is currently typing
  const isTyping = typingUsers.has(friendId);

  /**
   * Handle status change
   */
  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatar: user?.avatar || "👤",
          status: newStatus,
          bio: user?.bio || "",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setShowStatusDropdown(false);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  /**
   * Initiate a voice or video call with mobile-specific warnings
   * Checks permissions and provides user guidance for mobile devices
   */
  const handleStartCall = async (type: "voice" | "video") => {
    if (isMobile && type === "video") {
      const confirmed = confirm(
        "Video calls on mobile devices may use more data and battery. Make sure you have a stable connection. Continue?"
      );
      if (!confirmed) return;
    }

    // Check microphone permissions before starting call
    try {
      const permissionStatus = await navigator.permissions?.query({
        name: "microphone" as PermissionName,
      });
      if (permissionStatus?.state === "denied") {
        alert(
          "Microphone access is blocked. Please enable it in your browser settings:\n\n" +
            "Chrome: Settings → Privacy and security → Site settings → Microphone\n" +
            "Safari: Settings → Safari → Camera/Microphone"
        );
        return;
      }
    } catch (e) {
      // Permissions API not supported, continue anyway
    }

    startCall(friendId, type);
  };

  // Show loading spinner while fetching initial messages
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center glass-card m-2">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-blue-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-neutral-300">Loading messages...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-full flex flex-col glass-card relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5" />

      {/* Header with call buttons - ALWAYS VISIBLE */}
      <motion.div
        className="flex justify-between items-center p-4 md:p-5 border-b border-slate-700/50 backdrop-blur-sm bg-slate-800/40 relative z-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
              {friendAvatar && (friendAvatar.startsWith('http') || friendAvatar.startsWith('/')) ? (
                <img
                  src={friendAvatar}
                  alt={friendName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl md:text-2xl">
                  {friendAvatar || "👤"}
                </span>
              )}
            </div>
            {/* Online indicator */}
            {isConnected && onlineUsers.has(friendId) && (
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-400 rounded-full border-2 border-slate-900"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base md:text-lg">
              {friendName}
            </h3>
            <p className="text-slate-400 text-xs md:text-sm flex items-center gap-1.5">
              {onlineUsers.has(friendId) ? (
                <>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                  <span>Online</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                  <span>Offline</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right side: Status dropdown and call buttons */}
        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative" ref={statusDropdownRef}>
            <motion.button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="p-2 md:p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 transition-all flex items-center gap-1.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Change Status"
            >
              <span className="text-lg">
                {
                  STATUS_OPTIONS.find(
                    (s) => s.value === (user?.status || "online")
                  )?.icon
                }
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </motion.button>

            <AnimatePresence>
              {showStatusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-48 glass-card p-2 z-50 shadow-2xl"
                  style={{ background: "rgba(30, 41, 59, 0.95)" }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center gap-3 transition-all ${
                        user?.status === option.value
                          ? "bg-indigo-500/20 text-white"
                          : "hover:bg-slate-700/50 text-slate-300"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span className="text-sm font-medium flex-1">
                        {option.label}
                      </span>
                      {user?.status === option.value && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Call buttons */}
          <motion.button
            onClick={() => handleStartCall("voice")}
            disabled={isCallActive}
            className="p-2.5 md:p-3 rounded-xl bg-slate-800/60 hover:bg-teal-500/20 border border-slate-700/50 hover:border-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Voice Call"
          >
            <Phone className="w-4 h-4 md:w-5 md:h-5 text-teal-400" />
          </motion.button>
          <motion.button
            onClick={() => handleStartCall("video")}
            disabled={isCallActive}
            className="p-2.5 md:p-3 rounded-xl bg-slate-800/60 hover:bg-indigo-500/20 border border-slate-700/50 hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Video Call"
          >
            <Video className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
          </motion.button>
        </div>
      </motion.div>

      {/* Messages area with scrolling */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 modern-scrollbar min-h-0 relative z-10">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === userId;
            return (
              <motion.div
                key={message.id}
                className={`flex items-end gap-2 ${
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                {/* Avatar */}
                <motion.div
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md ${
                    isOwnMessage ? "bg-blue-600" : "bg-neutral-700"
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {isOwnMessage ? (
                    userAvatar && (userAvatar.startsWith('http') || userAvatar.startsWith('/')) ? (
                      <img
                        src={userAvatar}
                        alt="You"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs md:text-sm">
                        {userAvatar || "👤"}
                      </span>
                    )
                  ) : friendAvatar && (friendAvatar.startsWith('http') || friendAvatar.startsWith('/')) ? (
                    <img
                      src={friendAvatar}
                      alt={friendName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs md:text-sm">
                      {friendAvatar || "👤"}
                    </span>
                  )}
                </motion.div>

                {/* Message bubble */}
                <motion.div
                  className={`max-w-[75%] md:max-w-md px-3 md:px-4 py-2 md:py-2.5 rounded-2xl shadow-lg ${
                    isOwnMessage
                      ? "rounded-br-sm bg-blue-600 border border-blue-500/30"
                      : "rounded-bl-sm bg-neutral-800/60 border border-neutral-700/15"
                  }`}
                  style={{
                    backdropFilter: "blur(10px)",
                  }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="break-words whitespace-pre-wrap text-sm md:text-base leading-relaxed text-white">
                    {message.text}
                  </p>
                  <p
                    className={`text-xs mt-1.5 ${
                      isOwnMessage ? "text-blue-100/80" : "text-slate-400"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex items-center gap-3 text-neutral-400 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center overflow-hidden">
                {friendAvatar && (friendAvatar.startsWith('http') || friendAvatar.startsWith('/')) ? (
                  <img
                    src={friendAvatar}
                    alt={friendName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm">{friendAvatar || "👤"}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span>{friendName} is typing</span>
                <div className="flex gap-1">
                  <motion.div
                    className="w-1 h-1 bg-neutral-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-1 h-1 bg-neutral-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.8, delay: 0.2, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-1 h-1 bg-neutral-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.8, delay: 0.4, repeat: Infinity }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="px-4 md:px-6 py-3 border-t border-red-500/20 backdrop-blur-sm relative z-10 bg-red-500/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.div
        className="p-3 md:p-4 border-t border-slate-700/50 backdrop-blur-sm bg-slate-800/40 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex gap-2 md:gap-3">
          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${friendName}...`}
              className="w-full modern-input pr-10 resize-none focus-ring text-sm md:text-base"
              rows={1}
              disabled={sending}
              style={{ minHeight: "42px", maxHeight: "120px" }}
            />
            <motion.button
              className="absolute right-2 top-2 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smile className="w-4 h-4 text-slate-400" />
            </motion.button>
          </div>
          <motion.button
            onClick={handleSendMessage}
            disabled={sending || !messageText.trim()}
            className="px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-semibold text-white relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {sending ? (
              <motion.div
                className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Incoming Call Modal */}
      <AnimatePresence>
        {isIncomingCall && callerInfo && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-8 max-w-md w-full text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-blue-600"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {callType === "video" ? (
                  <Video className="w-10 h-10 text-white" />
                ) : (
                  <Phone className="w-10 h-10 text-white" />
                )}
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Incoming {callType === "video" ? "Video" : "Voice"} Call
              </h2>
              <p className="text-neutral-300 mb-6">
                {friendName} is calling...
              </p>

              {isMobile && (
                <p className="text-neutral-400 text-sm mb-4">
                  Make sure to allow microphone
                  {callType === "video" ? " and camera" : ""} access when
                  prompted
                </p>
              )}

              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={acceptCall}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Accept
                </motion.button>
                <motion.button
                  onClick={rejectCall}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Decline
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call Modal */}
      <AnimatePresence>
        {isCallActive && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-white text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {callType === "video" ? "Video" : "Voice"} Call with{" "}
                {friendName}
              </h2>
              {isMobile && callType === "video" && (
                <p className="text-sm text-neutral-400">
                  Rotate your device for better view
                </p>
              )}
            </div>

            {/* Video Streams */}
            {callType === "video" && (
              <motion.div
                className="relative w-full max-w-4xl aspect-video bg-neutral-900 rounded-2xl overflow-hidden mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Remote Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Local Video */}
                <motion.div
                  className="absolute bottom-4 right-4 w-32 h-24 bg-neutral-800 rounded-lg overflow-hidden border-2 border-white shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>
            )}

            {callType === "voice" && (
              <motion.div
                className="text-6xl mb-8"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📞
              </motion.div>
            )}

            {/* Call Controls */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={toggleAudio}
                className="p-4 rounded-2xl glass-button hover:bg-neutral-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-6 h-6 text-white" />
              </motion.button>
              {callType === "video" && (
                <motion.button
                  onClick={toggleVideo}
                  className="p-4 rounded-2xl glass-button hover:bg-neutral-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Video className="w-6 h-6 text-white" />
                </motion.button>
              )}
              <motion.button
                onClick={endCall}
                className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
