"use client";

import { useState, useEffect, useRef } from "react";

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
  friendStatus?: string;
}

export default function DirectMessages({
  userId,
  friendId,
  friendName,
  friendStatus = "offline",
}: DirectMessagesProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when component mounts or friendId changes
  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [friendId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
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
      setMessages(data.messages || []);
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
    if (!text) return;

    try {
      setSending(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch(`/api/messages/direct/${friendId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await res.json();
      setMessages((prev) => [...prev, { ...newMessage, username: "You" }]);
      setMessageText("");

      // Refresh to ensure we have latest messages
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error sending message");
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch(
        `/api/messages/direct/actions/${messageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: editText }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to edit message");
      }

      // Update message in state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, text: editText, editedAt: new Date().toISOString() } : m
        )
      );

      setEditingId(null);
      setEditText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error editing message");
      console.error("Error editing message:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch(`/api/messages/direct/actions/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete message");
      }

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting message");
      console.error("Error deleting message:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#36393F]">
        <div className="h-16 bg-[#2F3136] border-b border-[#202225] flex items-center px-4">
          <h2 className="text-[#DCDDDE] font-bold">{friendName}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B65F5]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#36393F]">
      {/* Header */}
      <div className="h-16 bg-[#2F3136] border-b border-[#202225] flex items-center justify-between px-4">
        <div>
          <h2 className="text-[#DCDDDE] font-bold flex items-center gap-2">
            <span>{friendName}</span>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                friendStatus === "online" ? "bg-green-500" : "bg-gray-500"
              }`}
            ></span>
          </h2>
          <p className="text-xs text-[#72767D] capitalize">{friendStatus}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-3 p-2 bg-red-500 bg-opacity-20 text-red-300 text-xs rounded">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#72767D] text-sm">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === userId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    isOwn
                      ? "bg-[#5B65F5] text-[#DCDDDE]"
                      : "bg-[#40444B] text-[#DCDDDE]"
                  }`}
                >
                  {editingId === message.id ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleEditMessage(message.id);
                          }
                        }}
                        className="w-full px-2 py-1 bg-[#2F3136] text-[#DCDDDE] rounded text-sm"
                      />
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => handleEditMessage(message.id)}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                          className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="break-words">{message.text}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-opacity-70">
                        <span className="text-xs opacity-75">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.editedAt && (
                          <span className="opacity-75">(edited)</span>
                        )}
                      </div>

                      {/* Edit/Delete buttons on hover (only for own messages) */}
                      {isOwn && (
                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setEditingId(message.id);
                              setEditText(message.text);
                            }}
                            className="text-xs px-2 py-1 bg-[#5B65F5] hover:bg-opacity-80 rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#202225] bg-[#2F3136] p-4">
        <div className="flex gap-3">
          <input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message @friend..."
            disabled={sending}
            className="flex-1 px-4 py-2 bg-[#40444B] text-[#DCDDDE] rounded-lg outline-none focus:ring-2 focus:ring-[#5B65F5] placeholder-[#72767D] disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !messageText.trim()}
            className="px-4 py-2 bg-[#5B65F5] hover:bg-opacity-80 disabled:bg-opacity-50 text-white rounded-lg transition font-medium"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
