"use client";

/**
 * Global Socket.IO Context with Automatic Presence Detection
 *
 * Provides a single persistent socket connection for all authenticated pages.
 * Automatically tracks user status:
 * - Online: socket is connected (user has the app open)
 * - Offline: socket disconnects (user closes the tab/browser)
 *
 * All pages share this one socket — no duplicate connections.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

/** Chat message structure */
interface Message {
  messageId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  username?: string;
  avatar?: string;
}

/** Everything the socket context provides to consumers */
export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  typingUsers: Set<string>;
  onlineUsers: Set<string>;
  userStatuses: Map<string, string>;
  sendMessage: (message: {
    messageId: string;
    senderId: string;
    receiverId: string;
    text: string;
    createdAt: string;
    audioUrl?: string;
  }) => void;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || null;

  // Socket state
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [userStatuses, setUserStatuses] = useState<Map<string, string>>(
    new Map(),
  );

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const currentStatusRef = useRef<string>("online");

  // ─── Status update (socket broadcast + DB persist) ────────────────────
  const updateStatus = useCallback(
    (newStatus: string) => {
      if (currentStatusRef.current === newStatus) return;
      currentStatusRef.current = newStatus;

      // Broadcast to other users via socket
      if (socketRef.current?.connected && userId) {
        socketRef.current.emit("status-change", {
          userId,
          status: newStatus,
        });
      }

      // Persist to database (fire-and-forget)
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (token) {
        fetch("/api/users/status", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }).catch(() => {});
      }
    },
    [userId],
  );

  // ─── Socket connection (runs once per authenticated user) ─────────────
  useEffect(() => {
    if (!userId) {
      // Not logged in — clean up any leftover socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setOnlineUsers(new Set());
      setUserStatuses(new Map());
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 5,
      timeout: 10000,
      extraHeaders: { "ngrok-skip-browser-warning": "true" },
    });

    socketRef.current = socket;

    // ── Connection lifecycle ──────────────────────────────────────────
    socket.on("connect", () => {
      console.log("🟢 Socket connected (global)");
      setIsConnected(true);
      socket.emit("join", userId);
      currentStatusRef.current = "online";
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", () => setIsConnected(false));
    socket.on("reconnect_failed", () => setIsConnected(false));

    // ── Messaging ────────────────────────────────────────────────────
    socket.on("receive-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // ── Typing indicators ────────────────────────────────────────────
    socket.on("user-typing", (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        data.isTyping ? next.add(data.userId) : next.delete(data.userId);
        return next;
      });
    });

    // ── Presence: initial user list ──────────────────────────────────
    socket.on("user-list", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
      const statusMap = new Map<string, string>();
      userIds.forEach((id) => statusMap.set(id, "online"));
      setUserStatuses(statusMap);
      console.log("📥 Online users list:", userIds);
    });

    // ── Presence: someone came online ────────────────────────────────
    socket.on("user-online", (onlineUserId: string) => {
      setOnlineUsers((prev) => new Set([...prev, onlineUserId]));
      setUserStatuses((prev) => new Map([...prev, [onlineUserId, "online"]]));
    });

    // ── Presence: someone went offline ───────────────────────────────
    socket.on("user-offline", (offlineUserId: string) => {
      setOnlineUsers((prev) => {
        const s = new Set(prev);
        s.delete(offlineUserId);
        return s;
      });
      setUserStatuses((prev) => new Map([...prev, [offlineUserId, "offline"]]));
    });

    // ── Presence: someone's status changed (online/offline) ──────────
    socket.on(
      "user-status-change",
      (data: { userId: string; status: string }) => {
        setUserStatuses(
          (prev) => new Map([...prev, [data.userId, data.status]]),
        );
        if (data.status === "offline") {
          setOnlineUsers((prev) => {
            const s = new Set(prev);
            s.delete(data.userId);
            return s;
          });
        } else {
          setOnlineUsers((prev) => new Set([...prev, data.userId]));
        }
      },
    );

    // Cleanup on unmount or userId change
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // ─── Presence tracking (online on connect, offline on tab close) ──────
  useEffect(() => {
    if (!userId || !isConnected) return;

    // Mark online as soon as socket connects
    updateStatus("online");

    // Best-effort: persist offline to DB when user closes the tab
    const handleBeforeUnload = () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        navigator.sendBeacon(
          "/api/users/status",
          new Blob([JSON.stringify({ status: "offline", token })], {
            type: "application/json",
          }),
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId, isConnected, updateStatus]);

  // ─── Messaging helpers ────────────────────────────────────────────────
  const sendMessage = useCallback(
    (message: {
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
    },
    [],
  );

  const sendTypingIndicator = useCallback(
    (receiverId: string, isTyping: boolean) => {
      if (socketRef.current?.connected && userId) {
        socketRef.current.emit("typing", {
          senderId: userId,
          receiverId,
          isTyping,
        });
      }
    },
    [userId],
  );

  // ─── Context value (memoized to prevent unnecessary consumer re-renders) ──
  const value: SocketContextType = useMemo(
    () => ({
      socket: socketRef.current,
      isConnected,
      messages,
      typingUsers,
      onlineUsers,
      userStatuses,
      sendMessage,
      sendTypingIndicator,
    }),
    [
      isConnected,
      messages,
      typingUsers,
      onlineUsers,
      userStatuses,
      sendMessage,
      sendTypingIndicator,
    ],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

/**
 * Hook to access the global socket context.
 * Must be used within SocketProvider.
 */
export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
}
