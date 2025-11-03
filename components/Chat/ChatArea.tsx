"use client";

import { User } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  username: string;
  avatar?: string;
  channelId: string;
  createdAt: string;
}

interface ChatAreaProps {
  channelId: string;
  user: User;
}

export default function ChatArea({ channelId, user }: ChatAreaProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for channel
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/messages?channelId=${channelId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [channelId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          text,
          channelId,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#36393F]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5B65F5] mx-auto mb-4"></div>
              <p className="text-[#72767D] text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#5B65F5] opacity-10 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">💬</span>
              </div>
              <p className="text-[#DCDDDE] text-lg font-semibold">
                No messages yet
              </p>
              <p className="text-[#72767D] text-sm mt-2">
                Be the first to say something!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              isOwnMessage={msg.userId === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-[#202225] p-4 bg-[#2F3136]">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
