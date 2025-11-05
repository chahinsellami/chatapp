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
}

export function useSocket(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    // Connect to Socket.IO server
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join", userId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("receive-message", (message: Message) => {
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
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("user-offline", (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
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
      socketRef.current.emit("send-message", message);
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
