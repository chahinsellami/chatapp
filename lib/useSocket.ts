"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  messageId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  username?: string;
  avatar?: string;
  audioUrl?: string;
}

export function useSocket(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ useSocket: userId is null/undefined");
      return;
    }

    console.log("🔌 Initializing socket connection for user:", userId);
    console.log("🔍 userId type:", typeof userId, "value:", JSON.stringify(userId));

    // Get Socket.IO backend URL from environment variable
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log("🌐 Connecting to Socket.IO server:", socketUrl);

    // Connect to Socket.IO server
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
      socket.emit("join", userId);
      console.log("📤 Sent join event with userId:", userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    socket.on("receive-message", (message: Message) => {
      console.log("📨 Message received in useSocket:", message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("user-typing", (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    socket.on("user-online", (userId: string) => {
      console.log("🟢 User came online:", userId);
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("user-offline", (userId: string) => {
      console.log("⚫ User went offline:", userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      console.log("🔌 Disconnecting socket");
      socket.disconnect();
    };
  }, [userId]);

  const sendMessage = (message: {
    messageId: string;
    senderId: string;
    receiverId: string;
    text: string;
    createdAt: string;
    audioUrl?: string;
  }) => {
    if (socketRef.current?.connected) {
      console.log("📤 Sending message via socket:", {
        messageId: message.messageId,
        from: message.senderId,
        to: message.receiverId,
        hasAudio: !!message.audioUrl,
      });
      socketRef.current.emit("send-message", message);
    } else {
      console.error("❌ Socket not connected, cannot send message");
    }
  };

  const sendTypingIndicator = (receiverId: string, isTyping: boolean) => {
    if (socketRef.current?.connected && userId) {
      socketRef.current.emit("typing", {
        senderId: userId,
        receiverId,
        isTyping,
      });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    sendMessage,
    sendTypingIndicator,
  };
}
