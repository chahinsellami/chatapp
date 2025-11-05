"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "./Layout/Sidebar";
import Image from "next/image";
import { MOCK_USERS, getUserById } from "../lib/users";
import { useWebSocket } from "../lib/useWebSocket";
import type { User } from "../lib/users";

// Message type for our chat
type Message = {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
};

// Conversation type
type Conversation = {
  userId: string;
  messages: Message[];
};

export default function Chat() {
  const currentUserId = "current-user-1";
  const [conversations, setConversations] = useState<{
    [userId: string]: Conversation;
  }>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // Track which users are currently typing in the selected conversation
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  // Track connection status
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  // Track if we've sent a typing indicator recently (to avoid spam)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // WebSocket Hook - Real-time Communication
  // ============================================================================
  // This hook handles all WebSocket communication:
  // 1. Connects to the server automatically on component mount
  // 2. Listens for incoming messages and typing updates
  // 3. Provides methods to send messages and typing indicators
  // 4. Automatically reconnects if connection drops
  // ============================================================================

  const ws = useWebSocket(currentUserId, {
    // Called when new message arrives from another user
    onMessage: (messageData) => {
      console.log("📨 New message received via WebSocket:", messageData);

      // Don't add our own messages (we already added them locally)
      if (messageData.senderId === currentUserId) {
        return;
      }

      // Add message to the conversation
      const otherUserId =
        messageData.senderId === currentUserId
          ? messageData.receiverId
          : messageData.senderId;

      setConversations((prev) => ({
        ...prev,
        [otherUserId]: {
          userId: otherUserId,
          messages: [...(prev[otherUserId]?.messages || []), messageData],
        },
      }));
    },

    // Called when typing status updates
    onTyping: (typingUsersList) => {
      console.log("⌨️ Typing users:", typingUsersList);
      // Filter out current user from the typing list
      const otherUsersTyping = typingUsersList.filter(
        (id) => id !== currentUserId
      );
      setTypingUsers(otherUsersTyping);
    },

    // Called when successfully connected to server
    onConnect: () => {
      console.log("✅ WebSocket connected!");
      setConnectionStatus("connected");
    },

    // Called when disconnected from server
    onDisconnect: () => {
      console.log("❌ WebSocket disconnected");
      setConnectionStatus("disconnected");
    },

    // Called when error occurs
    onError: (error) => {
      console.error("⚠️ WebSocket error:", error);
    },
  });

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          if (Object.keys(data).length > 0) {
            setSelectedUserId(Object.keys(data)[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
        // Initialize with empty conversations for demo
        const emptyConversations: { [key: string]: Conversation } = {};
        MOCK_USERS.filter((u) => u.id !== currentUserId).forEach((user) => {
          emptyConversations[user.id] = { userId: user.id, messages: [] };
        });
        setConversations(emptyConversations);
        if (MOCK_USERS.length > 0) {
          setSelectedUserId(MOCK_USERS[0].id);
        }
      }
    };
    loadConversations();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUserId, conversations]);

  // ============================================================================
  // Removed: Polling for typing status
  // ============================================================================
  // Before: We polled every 500ms: setInterval(fetchTypingStatus, 500)
  // Now: WebSocket automatically pushes typing updates in real-time
  // Result: Instant typing indicators, 0 wasted requests! ⚡
  // ============================================================================

  // Send message
  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !selectedUserId) return;

    setLoading(true);
    setInput("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          senderId: currentUserId,
          receiverId: selectedUserId,
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();

        // ====================================================================
        // IMPORTANT: Dual Update - Database + WebSocket
        // ====================================================================
        // 1. Add message to local state immediately (for UI responsiveness)
        // 2. Send message via WebSocket (broadcasts to all connected clients)
        // 3. Message also saved to database (by API route)
        // ====================================================================

        // Update local state immediately
        setConversations((prev) => ({
          ...prev,
          [selectedUserId]: {
            userId: selectedUserId,
            messages: [...(prev[selectedUserId]?.messages || []), newMessage],
          },
        }));

        // Broadcast message via WebSocket to all connected clients
        if (ws.isConnected) {
          ws.sendMessage(text, currentUserId, selectedUserId);
          console.log("📤 Message sent via WebSocket");
        } else {
          console.warn(
            "⚠️ WebSocket not connected - message saved to database only"
          );
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?") || !selectedUserId) return;

    try {
      const res = await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: messageId }),
      });

      if (res.ok) {
        setConversations((prev) => ({
          ...prev,
          [selectedUserId]: {
            userId: selectedUserId,
            messages: (prev[selectedUserId]?.messages || []).filter(
              (m) => m.id !== messageId
            ),
          },
        }));
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Handle typing - sends typing indicator via WebSocket
  // This function is called when user types in the input field
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInput(text);

    if (!selectedUserId) return;

    // Clear previous timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // ========================================================================
    // WebSocket Typing Indicator
    // ========================================================================
    // When user types:
    // 1. Send typing=true via WebSocket (broadcast to all clients)
    // 2. Set 2-second timeout (if no more typing, send typing=false)
    // Result: Others see typing indicator instantly! ⚡
    // ========================================================================

    // Only send typing indicator if user actually typed something
    if (text.trim()) {
      if (ws.isConnected) {
        // Send typing indicator via WebSocket to all clients
        ws.sendTyping(true);
        console.log("⌨️ Sent: User is typing");
      }
    }

    // Set a timeout to clear typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      if (ws.isConnected) {
        // Send typing=false to indicate we stopped typing
        ws.sendTyping(false);
        console.log("⌨️ Sent: User stopped typing");
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();

      // Clear typing indicator after sending
      // Send typing=false via WebSocket
      if (selectedUserId && ws.isConnected) {
        ws.sendTyping(false);
      }
    }
  };

  const currentConversation = selectedUserId
    ? conversations[selectedUserId]
    : null;
  const currentMessages = currentConversation?.messages || [];
  const selectedUser = selectedUserId ? getUserById(selectedUserId) : null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        selectedUserId={selectedUserId || ""}
        onSelectUser={setSelectedUserId}
        currentUserId={currentUserId}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        {selectedUser ? (
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center gap-4 shadow">
            <Image
              src={selectedUser.avatar}
              alt={selectedUser.name}
              width={48}
              height={48}
              unoptimized
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{selectedUser.name}</h1>
              <div className="flex items-center gap-2">
                {/* Connection Status Indicator */}
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    ws.isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                  }`}
                ></span>
                <p className="text-sm text-blue-100 capitalize">
                  {selectedUser.status}
                </p>
                <p className="text-xs text-blue-200">
                  {ws.isConnected ? "(Real-time)" : "(Offline)"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
            <h1 className="text-xl font-bold">
              Select a user to start chatting
            </h1>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {currentMessages.length === 0 && selectedUser ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            currentMessages.map((message: Message) => {
              const isFromCurrentUser = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isFromCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isFromCurrentUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="wrap-break-word">{message.text}</p>
                    <div
                      className={`text-xs mt-1 flex items-center gap-2 ${
                        isFromCurrentUser ? "text-blue-100" : "text-gray-600"
                      }`}
                    >
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isFromCurrentUser && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="hover:underline cursor-pointer ml-auto"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator - Shows which users are currently typing */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-300 text-gray-900">
                <p className="text-sm italic">
                  {typingUsers
                    .map((id) => getUserById(id)?.name || "Someone")
                    .join(", ")}{" "}
                  {typingUsers.length === 1 ? "is" : "are"} typing
                  <span className="ml-1">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></span>
                    <span
                      className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </span>
                </p>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Area */}
        {selectedUser ? (
          <div className="border-t bg-white px-4 py-3 flex items-center gap-2">
            <input
              value={input}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition"
            >
              {loading ? "..." : "➤"}
            </button>
          </div>
        ) : (
          <div className="border-t bg-gray-100 px-4 py-3 text-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
