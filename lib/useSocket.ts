"use client";

/**
 * Custom React hook for managing Socket.IO connections and real-time messaging
 * Handles connection state, message sending/receiving, typing indicators, and online user presence
 */

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Interface defining the structure of a chat message
 */
interface Message {
  messageId: string; // Unique identifier for the message
  senderId: string; // ID of the user who sent the message
  receiverId: string; // ID of the user who should receive the message
  text: string; // The actual message content
  createdAt: string; // Timestamp when the message was created
  username?: string; // Optional display name of the sender
  avatar?: string; // Optional avatar URL of the sender
}

/**
 * Custom hook for Socket.IO real-time communication
 * @param userId - The current user's ID, null if not authenticated
 * @returns Object containing socket state and communication methods
 */
export function useSocket(userId: string | null) {
  // Connection state - tracks if socket is connected to server
  const [isConnected, setIsConnected] = useState(false);

  // Messages state - stores all received messages in chronological order
  const [messages, setMessages] = useState<Message[]>([]);

  // Typing indicators - tracks which users are currently typing
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Online users - tracks which users are currently online
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Socket reference - maintains the Socket.IO connection instance
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only establish connection if user is authenticated
    if (!userId) return;

    // Determine socket server URL (defaults to localhost for development)
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    // Establish Socket.IO connection with configuration
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
      withCredentials: true, // Include credentials for authentication
      reconnection: true, // Enable auto-reconnection
      reconnectionDelay: 5000, // Wait 5 seconds before reconnecting
      reconnectionAttempts: 3, // Only try 3 times to avoid spam
      timeout: 10000, // Connection timeout
      // Add ngrok-specific headers for WebSocket support
      extraHeaders: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    socketRef.current = socket;

    // Handle successful connection
    socket.on("connect", () => {
      // Socket.IO connected
      setIsConnected(true);
      // Join the user's personal room for direct messaging
      socket.emit("join", userId);
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      // Socket.IO disconnected: (reason)
      setIsConnected(false);
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      // Socket.IO connection error: (error.message)
      setIsConnected(false);
    });

    // Handle reconnection attempts
    socket.on("reconnect_attempt", (attemptNumber) => {
      // Reconnection attempt
    });

    // Handle failed reconnection
    socket.on("reconnect_failed", () => {
      // Socket.IO reconnection failed after 3 attempts
      setIsConnected(false);
    });

    // Handle incoming messages from other users
    socket.on("receive-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Handle typing indicators from other users
    socket.on("user-typing", (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId); // Add user to typing set
        } else {
          newSet.delete(data.userId); // Remove user from typing set
        }
        return newSet;
      });
    });

    // Handle user coming online
    socket.on("user-online", (userId: string) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    // Handle user going offline
    socket.on("user-offline", (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Cleanup: disconnect socket when component unmounts or userId changes
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  /**
   * Sends a message to another user via Socket.IO
   * @param message - The message object containing all message details
   */
  const sendMessage = (message: {
    messageId: string;
    senderId: string;
    receiverId: string;
    text: string;
    createdAt: string;
    audioUrl?: string; // Optional audio attachment for voice messages
  }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("send-message", message);
    }
  };

  /**
   * Sends typing indicator to show/hide typing status to another user
   * @param receiverId - ID of the user to send typing indicator to
   * @param isTyping - Whether the current user is typing or not
   */
  const sendTypingIndicator = (receiverId: string, isTyping: boolean) => {
    if (socketRef.current?.connected && userId) {
      socketRef.current.emit("typing", {
        senderId: userId,
        receiverId,
        isTyping,
      });
    }
  };

  // Return hook interface with all state and methods
  return {
    socket: socketRef.current, // Raw socket instance for advanced usage
    isConnected, // Connection status
    messages, // Array of received messages
    typingUsers, // Set of users currently typing
    onlineUsers, // Set of users currently online
    sendMessage, // Function to send messages
    sendTypingIndicator, // Function to send typing indicators
  };
}
